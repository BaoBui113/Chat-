import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { File as MulterFile } from 'multer';

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

  async uploadFile(file: MulterFile): Promise<string> {
    const uploadResult = await this.s3
      .upload({
        Bucket: this.bucketName,
        Key: `${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
      .promise();

    return uploadResult.Location;
  }
}
