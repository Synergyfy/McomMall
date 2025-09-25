import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET; // unsigned preset recommended

    if (!cloudName || !uploadPreset) {
      return NextResponse.json({ error: 'Cloudinary is not configured' }, { status: 500 });
    }

    const cloudForm = new FormData();
    cloudForm.append('file', file);
    cloudForm.append('upload_preset', uploadPreset);

    const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: cloudForm,
    });
    const cloudinaryJson = await cloudinaryRes.json();
    if (!cloudinaryRes.ok) {
      return NextResponse.json({ error: cloudinaryJson?.error?.message || 'Cloudinary upload failed' }, { status: 500 });
    }

    const secure_url = cloudinaryJson.secure_url as string;
    return NextResponse.json({ secure_url }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}


