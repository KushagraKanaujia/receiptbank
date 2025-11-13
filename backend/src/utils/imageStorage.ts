import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import crypto from 'crypto';

// Cloudflare R2 configuration (S3-compatible)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || 'https://your-account-id.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'receiptbank-images';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://images.receiptbank.com';

/**
 * Upload image to Cloudflare R2
 * @param buffer - Image buffer
 * @param filename - Original filename
 * @returns Public URL of uploaded image
 */
export const uploadImage = async (buffer: Buffer, filename: string): Promise<string> => {
  try {
    // Compress and optimize image
    const optimizedBuffer = await sharp(buffer)
      .resize(1200, 1600, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    // Generate unique filename
    const hash = crypto.createHash('sha256').update(optimizedBuffer).digest('hex').substring(0, 16);
    const timestamp = Date.now();
    const ext = filename.split('.').pop() || 'jpg';
    const key = `receipts/${timestamp}-${hash}.${ext}`;

    // Upload to R2
    await r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: optimizedBuffer,
        ContentType: 'image/jpeg',
        CacheControl: 'public, max-age=31536000',
      })
    );

    return `${PUBLIC_URL}/${key}`;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Delete image from Cloudflare R2
 * @param imageUrl - URL of image to delete
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  try {
    const key = imageUrl.replace(`${PUBLIC_URL}/`, '');
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );
  } catch (error: any) {
    console.error('Error deleting image:', error);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Generate perceptual hash of image for duplicate detection
 * @param buffer - Image buffer
 * @returns Hash string
 */
export const generateImageHash = async (buffer: Buffer): Promise<string> => {
  try {
    // Generate perceptual hash using average hash algorithm
    const resized = await sharp(buffer)
      .resize(8, 8, { fit: 'fill' })
      .greyscale()
      .raw()
      .toBuffer();

    // Calculate average
    const pixels = new Uint8Array(resized);
    const avg = pixels.reduce((sum, val) => sum + val, 0) / pixels.length;

    // Generate hash
    let hash = '';
    for (let i = 0; i < pixels.length; i++) {
      hash += pixels[i] > avg ? '1' : '0';
    }

    return hash;
  } catch (error: any) {
    console.error('Error generating image hash:', error);
    throw new Error(`Failed to generate image hash: ${error.message}`);
  }
};

/**
 * Extract EXIF metadata from image for fraud detection
 * @param buffer - Image buffer
 * @returns Metadata object
 */
export const extractMetadata = async (buffer: Buffer): Promise<any> => {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      space: metadata.space,
      channels: metadata.channels,
      density: metadata.density,
      hasAlpha: metadata.hasAlpha,
      exif: metadata.exif,
    };
  } catch (error: any) {
    console.error('Error extracting metadata:', error);
    return null;
  }
};
