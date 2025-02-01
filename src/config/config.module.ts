import { Module } from '@nestjs/common';
import { mongoConfig } from './mongo.config';
import { AuthConfig } from './auth.config';

@Module({
  providers: [
    {
      provide: 'MONGO_CONFIG',
      useValue: mongoConfig,
    },
    AuthConfig,
  ],
  exports: ['MONGO_CONFIG', AuthConfig],
})
export class ConfigModule {}
