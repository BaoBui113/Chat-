import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
// Define interface for uploaded file (Multer File object)
export interface UploadedFile {
  /** Field name from the form */
  fieldname: string;
  /** Original filename provided by the client */
  originalname: string;
  /** File encoding */
  encoding: string;
  /** MIME type of the file */
  mimetype: string;
  /** File content as Buffer */
  buffer: Buffer;
  /** Size of the file in bytes */
  size: number;
}

@Injectable()
export class S3Service {
  private s3: AWS.S3;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId:
          this.configService.get<string>('AWS_BUCKET_ACCESS_KEY') ?? '',
        secretAccessKey:
          this.configService.get<string>('AWS_BUCKET_SECRET_KEY') ?? '',
      },
    });
    this.bucketName = this.configService.get<string>('AWS_BUCKET_NAME') ?? '';
  }

  async uploadFile(file: UploadedFile): Promise<string> {
    const uploadResult = await this.s3
      .upload({
        Bucket: this.bucketName,
        Key: `${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    return uploadResult.Key;
  }

  getSignedCloudFrontUrl(fileKey: string, expiresInSeconds = 3600): string {
    const cloudFrontUrl = this.configService.get<string>('CLOUDFRONT_URL');
    const keyPairId = this.configService.get<string>('CLOUDFRONT_KEY_PAIR_ID');
    const privateKey = this.configService.get<string>('CLOUDFRONT_PRIVATE_KEY');

    if (!cloudFrontUrl || !keyPairId || !privateKey) {
      const missingVars: string[] = [];
      if (!cloudFrontUrl) missingVars.push('CLOUDFRONT_URL');
      if (!keyPairId) missingVars.push('CLOUDFRONT_KEY_PAIR_ID');
      if (!privateKey) missingVars.push('CLOUDFRONT_PRIVATE_KEY');

      throw new Error(
        `CloudFront configuration is missing: ${missingVars.join(', ')}. Please check your environment variables.`,
      );
    }

    // Process private key - replace \n with actual newlines
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

    // Full file URL
    const fileUrl = `${cloudFrontUrl}/${fileKey}`;

    try {
      // Generate signed URL
      const signedUrl = getSignedUrl({
        url: fileUrl,
        keyPairId,
        privateKey: formattedPrivateKey,
        dateLessThan: new Date(
          Date.now() + expiresInSeconds * 1000,
        ).toISOString(),
      });

      return signedUrl;
    } catch (error) {
      console.error('Error generating CloudFront signed URL:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to generate signed URL: ${errorMessage}`);
    }
  }

  getCloudFrontUrl() {
    const cloudFrontUrl = this.configService.get<string>('CLOUDFRONT_URL');
    if (!cloudFrontUrl) {
      throw new Error('CLOUDFRONT_URL is not configured');
    }
    return cloudFrontUrl;
  }
}
