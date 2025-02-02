import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { MONGODB_CONNECTION } from '../../../database/mongodb.provider';
import { MongoClient, GridFSBucket } from 'mongodb';
import { ProfileImage } from '../type/association.type';

@Injectable()
export class ImageUploadService {
  private bucket: GridFSBucket;

  constructor(
    @Inject(MONGODB_CONNECTION)
    private readonly mongoClient: MongoClient,
  ) {
    this.bucket = new GridFSBucket(this.mongoClient.db(), {
      bucketName: 'profileImages',
    });
  }

  async uploadProfileImage(
    file: Express.Multer.File,
    associationId: string,
  ): Promise<ProfileImage> {
    const filename = `${associationId}-${Date.now()}-${file.originalname}`;

    // Upload le fichier dans GridFS
    const uploadStream = this.bucket.openUploadStream(filename, {
      contentType: file.mimetype,
      metadata: {
        associationId,
        uploadedAt: new Date(),
      },
    });

    await new Promise((resolve, reject) => {
      uploadStream.on('error', reject);
      uploadStream.on('finish', resolve);
      uploadStream.end(file.buffer);
    });

    return {
      url: `/api/association/${associationId}/profile-image`,
      filename,
      contentType: file.mimetype,
      uploadedAt: new Date(),
    };
  }

  async deleteProfileImage(filename: string): Promise<void> {
    const file = await this.bucket.find({ filename }).next();
    if (file) {
      await this.bucket.delete(file._id);
    }
  }

  async getProfileImage(filename: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const downloadStream = this.bucket.openDownloadStreamByName(filename);

      downloadStream.on('data', chunk => chunks.push(chunk));
      downloadStream.on('error', reject);
      downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
