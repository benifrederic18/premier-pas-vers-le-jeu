import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return new NextResponse('Non autorisé', { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'ppvlj';

    if (!file) {
      return NextResponse.json({ error: 'Fichier manquant.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: 'auto',
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
    });

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error: any) {
    console.error('Erreur upload:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'upload.' }, { status: 500 });
  }
}
