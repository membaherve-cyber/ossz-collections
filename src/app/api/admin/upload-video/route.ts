import { spawn } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCurrentUser, canManageCatalogue } from "@/lib/auth";
import { saveUpload } from "@/lib/media-storage";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_VIDEO_MB = 120;
const MAX_IMAGE_MB = 15;

/**
 * Runs ffmpeg with a timeout guard. Shared-hosting and Vercel functions kill
 * long processes anyway; this keeps the API responsive if ffmpeg hangs.
 */
function runFfmpeg(args: string[], timeoutMs = 55_000): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", ...args], {
      stdio: ["ignore", "ignore", "pipe"],
    });
    let stderr = "";
    child.stderr?.on("data", (d) => (stderr += String(d)));
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("ffmpeg timed out"));
    }, timeoutMs);
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve();
      else reject(new Error(stderr || `ffmpeg exited with code ${code}`));
    });
  });
}

async function probeDurationSeconds(file: string): Promise<number | null> {
  const out = spawn("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    file,
  ]);
  let text = "";
  out.stdout?.on("data", (d) => (text += String(d)));
  return new Promise((resolve) => {
    out.on("error", () => resolve(null));
    out.on("close", () => {
      const n = Number.parseFloat(text.trim());
      resolve(Number.isFinite(n) ? Math.round(n) : null);
    });
  });
}

/**
 * POST /api/admin/upload-video
 * multipart/form-data: file=<video|image>, kind=lookbook-video|lookbook-image
 *
 * Videos are transcoded to a web-friendly H.264 MP4 (720p cap, faststart) and
 * a WebM (VP9) variant is added when ffmpeg has libvpx. A poster frame is
 * grabbed at 1s for instant first paint. If ffmpeg is missing, the original
 * file is stored untouched so the feature still works.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !canManageCatalogue(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = form.get("file");
  const kind = String(form.get("kind") ?? "lookbook-video");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }

  const isVideo = file.type.startsWith("video/") || /\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(file.name);

  if (kind === "lookbook-video" && !isVideo) {
    return NextResponse.json({ error: "Expected a video file" }, { status: 400 });
  }
  if (!isVideo && file.size > MAX_IMAGE_MB * 1024 * 1024) {
    return NextResponse.json({ error: `Image exceeds ${MAX_IMAGE_MB} MB` }, { status: 413 });
  }
  if (isVideo && file.size > MAX_VIDEO_MB * 1024 * 1024) {
    return NextResponse.json({ error: `Video exceeds ${MAX_VIDEO_MB} MB` }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // ---------- images: store as-is (Next/Image handles optimisation) ----------
  if (!isVideo) {
    const stored = await saveUpload("images", file.name, buffer);
    return NextResponse.json({ url: stored.url, mediaType: "image", optimized: false });
  }

  // ---------- videos: transcode + poster via ffmpeg when available ----------
  const workDir = await mkdtemp(path.join(tmpdir(), "ossz-video-"));
  try {
    const inputPath = path.join(workDir, `input${path.extname(file.name) || ".mp4"}`);
    await writeFile(inputPath, buffer);

    let optimized = false;
    let webmUrl: string | null = null;
    let posterUrl: string | null = null;
    let durationSeconds: number | null = null;
    let videoUrl = "";

    try {
      // Poster frame first — cheap and independent of the transcode.
      const posterShot = await runFfmpeg([
        "-y", "-ss", "1", "-i", inputPath,
        "-frames:v", "1", "-vf", "scale=720:-2",
        path.join(workDir, "poster.jpg"),
      ]).then(() => readFile(path.join(workDir, "poster.jpg")));

      const poster = await saveUpload("posters", `poster-${file.name.replace(/\.[^.]+$/, "")}.jpg`, posterShot);
      posterUrl = poster.url;

      // Web-friendly MP4: H.264 + AAC, 720p cap, faststart for streaming.
      await runFfmpeg([
        "-y", "-i", inputPath,
        "-vf", "scale='min(1280,iw)':-2",
        "-c:v", "libx264", "-preset", "faster", "-crf", "26",
        "-c:a", "aac", "-b:a", "96k", "-ac", "2",
        "-movflags", "+faststart",
        path.join(workDir, "out.mp4"),
      ]);
      const mp4 = await readFile(path.join(workDir, "out.mp4"));
      const stored = await saveUpload("videos", `look-${file.name.replace(/\.[^.]+$/, "")}.mp4`, mp4);
      videoUrl = stored.url;
      optimized = true;

      durationSeconds = await probeDurationSeconds(path.join(workDir, "out.mp4"));
    } catch (ffmpegError) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[ossz] ffmpeg unavailable or failed — storing original video", ffmpegError);
      }
    }

    if (!optimized) {
      // No ffmpeg: keep the original so uploads still work everywhere.
      const stored = await saveUpload("videos", file.name, buffer);
      videoUrl = stored.url;
    }

    // Optional WebM variant when libvpx exists (skip on failure — MP4 suffices).
    if (optimized) {
      try {
        await runFfmpeg([
          "-y", "-i", inputPath,
          "-vf", "scale='min(1280,iw)':-2",
          "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "34",
          "-c:a", "libopus", "-b:a", "96k",
          path.join(workDir, "out.webm"),
        ]);
        const webm = await readFile(path.join(workDir, "out.webm"));
        const storedWebm = await saveUpload("videos", `look-${file.name.replace(/\.[^.]+$/, "")}.webm`, webm);
        webmUrl = storedWebm.url;
      } catch {
        /* WebM optional */
      }
    }

    return NextResponse.json({
      url: videoUrl,
      webmUrl,
      posterUrl,
      durationSeconds,
      mediaType: "video",
      optimized,
    });
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
