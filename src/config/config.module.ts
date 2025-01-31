import { Module } from '@nestjs/common';
import { mongoConfig } from './mongo.config';

@Module({
  providers: [
    {
      provide: 'MONGO_CONFIG',
      useValue: mongoConfig,
    },
  ],
  exports: ['MONGO_CONFIG'],
})
export class ConfigModule {}
