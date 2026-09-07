import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "node:path";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a JPG, PNG, or WebP image." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5 MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `proof-${timestamp}-${safeName}`;

    // Determine upload directory
    const uploadDir = process.env.VERCEL
      ? "/tmp"
      : path.join(process.cwd(), "public", "uploads", "payment-proofs");

    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return the public URL
    const url = `/uploads/payment-proofs/${filename}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error("Payment proof upload error:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
