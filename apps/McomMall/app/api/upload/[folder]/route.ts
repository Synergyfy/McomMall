import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary Config:', {
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '******' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'MISSING',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '******' : 'MISSING',
});

// Configure Multer for memory storage (keeps parity with existing route)
const storage = multer.memoryStorage();
multer({ storage });

export async function POST(req: NextRequest, { params }: { params: Promise<{ folder: string }> }) {
  try {
    const { folder } = await params;
    if (!folder || typeof folder !== 'string') {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }

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

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          timeout: 60000
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result!);
          }
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json(result);
  } catch (error) {
    let message = 'An unknown error occurred';
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}