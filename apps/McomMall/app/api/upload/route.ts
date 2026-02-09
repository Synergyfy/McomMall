import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for memory storage
const storage = multer.memoryStorage();
multer({ storage });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/', 'video/', 'application/'];
    if (!allowedTypes.some(type => file.type.startsWith(type))) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images, videos and documents are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (30MB limit)
    if (file.size > 30 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds the 30MB limit.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'profile-pictures',
          resource_type: 'auto',
          // Ensure we don't hang on large files
          timeout: 60000
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Using end() with buffer is more reliable in serverless environments than piping
      uploadStream.end(buffer);
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to upload to Cloudinary' },
      { status: 500 }
    );
  }
}
