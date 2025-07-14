import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { z } from 'zod';
import { fileSchema } from '../utils/file-utils';
import 'dotenv/config';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class AwsS3Service {
  private readonly logger = new Logger(AwsS3Service.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor() {
    const config: any = {
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    };

    this.s3Client = new S3Client(config);
    this.bucketName = process.env.AWS_BUCKET_NAME;
  }

  async uploadFile(userId: string, file: z.infer<typeof fileSchema>): Promise<{ fileKey: string }> {
    try {
      if (!this.bucketName) {
        throw new Error('AWS_BUCKET_NAME non configuré');
      }

      const fileKey = `avatars/${userId}/${Date.now()}-${file.originalname}`;

      const putObjectCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: 'public, max-age=31536000',
      });

      const result = await this.s3Client.send(putObjectCommand);

      if (result.$metadata.httpStatusCode !== 200) {
        this.logger.error(`Erreur HTTP: ${result.$metadata.httpStatusCode}`);
      }

      return {
        fileKey: fileKey,
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de l'avatar: ${error.message}`);
      throw new InternalServerErrorException("Erreur lors de la mise à jour de l'avatar");
    }
  }

  async uploadFileAnnouncement(
    id: string,
    file: z.infer<typeof fileSchema>,
  ): Promise<{ fileKey: string }> {
    try {
      if (!this.bucketName) {
        throw new Error('AWS_BUCKET_NAME non configuré');
      }

      const fileKey = `announcement/${id}/${Date.now()}-${file.originalname}`;

      const putObjectCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: 'public, max-age=31536000',
      });

      const result = await this.s3Client.send(putObjectCommand);

      if (result.$metadata.httpStatusCode !== 200) {
        this.logger.error(`Erreur HTTP: ${result.$metadata.httpStatusCode}`);
      }

      return {
        fileKey: fileKey,
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la mise à jour de l'avatar: ${error.message}`);
      throw new InternalServerErrorException("Erreur lors de la mise à jour de l'avatar");
    }
  }

  async deleteFile(fileKey: string): Promise<{ fileKey: string }> {
    try {
      if (!this.bucketName) {
        throw new Error('AWS_BUCKET_NAME non configuré');
      }

      const deleteObjectCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      const result = await this.s3Client.send(deleteObjectCommand);
      if (result.$metadata.httpStatusCode !== 200 && result.$metadata.httpStatusCode !== 204) {
        this.logger.error(`Erreur HTTP: ${result.$metadata.httpStatusCode}`);
      }
      return {
        fileKey,
      };
    } catch (error) {
      this.logger.error(`Erreur lors de la suppression du fichier: ${error.message}`);
      throw new InternalServerErrorException('Erreur lors de la suppression du fichier');
    }
  }

  async getFileUrl(fileKey: string): Promise<string> {
    try {
      if (!this.bucketName) {
        throw new Error('AWS_BUCKET_NAME non configuré');
      }

      const getObjectCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      const result = await getSignedUrl(this.s3Client, getObjectCommand);
      if (!result) {
        throw new InternalServerErrorException("Erreur lors de la génération de l'URL du fichier");
      }
      return result;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de l'URL du fichier: ${error.message}`);
      throw new InternalServerErrorException("Erreur lors de la récupération de l'URL du fichier");
    }
  }
}
