import { NextResponse } from "next/server";
import { driveThumbnailUrl } from "@/lib/catalogue-images";

export const dynamic = "force-dynamic";

/**
 * Fallback image server.
 *
 * If public/catalogue is uploaded, static files win and this route is never
 * used. If public/catalogue is missing from GitHub/Vercel, this route catches
 * the same URL and proxies the matching public Google Drive image instead.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const safe = decodeURIComponent(file).replace(/[^A-Za-z0-9_.-]/g, "");
  const url = driveThumbnailUrl(safe, "w1200");

  if (!url) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const upstream = await fetch(url, {
    // Google Drive thumbnails are public but can occasionally be slow; Vercel
    // will cache the response below after the first successful fetch.
    headers: { accept: "image/*" },
    next: { revalidate: 60 * 60 * 24 * 30 },
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "Could not fetch image", status: upstream.status },
      { status: 502 },
    );
  }

  const body = await upstream.arrayBuffer();
  return new Response(body, {
    headers: {
      "content-type": upstream.headers.get("content-type") || "image/jpeg",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
