import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '../config/config.module';
import { PostgresConfig } from '../config/postgres.config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: PostgresConfig) => config.typeOrmConfig,
      inject: [PostgresConfig],
    }),
  ],
})
export class DatabaseModule {}
