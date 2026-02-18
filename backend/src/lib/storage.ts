import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: !!process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
    },
});

const BUCKET_NAME = process.env.S3_BUCKET || 'arena-products';

export class StorageService {
    static async uploadFile(file: {
        buffer: Buffer;
        mimetype: string;
        originalname: string;
    }, folder: string = 'products'): Promise<{ url: string; key: string }> {
        const ext = file.originalname.split('.').pop() || 'jpg';
        const key = `${folder}/${uuidv4()}.${ext}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
        });

        await s3Client.send(command);

        const baseUrl = process.env.S3_PUBLIC_URL || process.env.S3_ENDPOINT || `https://${BUCKET_NAME}.s3.amazonaws.com`;
        const url = `${baseUrl.replace(/\/$/, '')}/${BUCKET_NAME}/${key}`;

        return { url, key };
    }

    static async deleteFile(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        await s3Client.send(command);
    }
}
