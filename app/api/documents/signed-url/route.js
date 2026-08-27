import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const resourceType = searchParams.get('resourceType') || 'image';

  if (!id) {
    return NextResponse.json({ error: 'Missing document ID' }, { status: 400 });
  }

  // Whitelist resource type to prevent unintended values.
  if (!['image', 'raw', 'auto'].includes(resourceType)) {
    return NextResponse.json({ error: 'Invalid resource type' }, { status: 400 });
  }

  try {
    const expiresInSeconds = parseInt(process.env.SIGNED_URL_EXPIRATION_SECONDS, '10') || 60;
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

    // Generate a signed URL with a short expiration.
    // Note: This route must be protected by authentication and authorization in production.
    const signedUrl = cloudinary.v2.utils.private_download_url(id, '', {
      resource_type: resourceType,
      type: 'authenticated',
      sign_url: true,
      expires_at: expiresAt,
      secure: true,
    });

    // Do not log or cache the signed URL.
    return NextResponse.json({ url: signedUrl, expiresInSeconds });
  } catch (error) {
    // Avoid logging error details as the error may contain sensitive information.
    return NextResponse.json({ error: 'Unable to generate signed URL' }, { status: 500 });
  }
}