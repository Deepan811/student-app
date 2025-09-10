
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { promisify } from 'util';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile-pictures',
    format: async (req, file) => 'png', // supports promises as well
    public_id: (req, file) => file.originalname,
  },
});

const upload = multer({ storage: storage });

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file');

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'profile-pictures' }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }).end(buffer);
    });

    return NextResponse.json({ success: true, url: result.secure_url });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
