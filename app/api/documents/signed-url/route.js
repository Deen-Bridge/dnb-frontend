import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

function signCloudinaryRequest(params, apiSecret) {
  const payload = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  return crypto.createHash('sha1').update(`${payload}${apiSecret}`).digest('hex');
}

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
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Cloudinary credentials are not configured' }, { status: 500 });
    }

    const expiresInSeconds = parseInt(process.env.SIGNED_URL_EXPIRATION_SECONDS, '10') || 60;
    const timestamp = Math.floor(Date.now() / 1000);
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;

    // Generate a signed URL with a short expiration.
    // Note: This route must be protected by authentication and authorization in production.
    const signatureParams = {
      timestamp,
      public_id: id,
      type: 'authenticated',
      expires_at: expiresAt,
    };
    const signature = signCloudinaryRequest(signatureParams, apiSecret);
    const signedParams = new URLSearchParams({
      ...Object.fromEntries(Object.entries(signatureParams).map(([key, value]) => [key, String(value)])),
      signature,
      api_key: apiKey,
    });
    const signedUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/download?${signedParams.toString()}`;

    // Do not log or cache the signed URL.
    return NextResponse.json({ url: signedUrl, expiresInSeconds });
  } catch (error) {
    // Avoid logging error details as the error may contain sensitive information.
    return NextResponse.json({ error: 'Unable to generate signed URL' }, { status: 500 });
  }
}
