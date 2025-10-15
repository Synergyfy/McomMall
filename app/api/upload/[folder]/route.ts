import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest, { params }: any) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: params.folder,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ url: (result as UploadApiResponse).secure_url });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload to Cloudinary' },
      { status: 500 }
    );
  }
}