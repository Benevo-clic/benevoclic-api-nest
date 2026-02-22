import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class PostgresConfig {
  constructor(private configService: ConfigService) {}

  get host(): string {
    return this.configService.get<string>('POSTGRES_HOST', 'localhost');
  }

  get port(): number {
    return this.configService.get<number>('POSTGRES_PORT', 5432);
  }

  get username(): string {
    return this.configService.get<string>('POSTGRES_USER', 'postgres');
  }

  get password(): string {
    return this.configService.get<string>('POSTGRES_PASSWORD', 'postgres');
  }

  get database(): string {
    return this.configService.get<string>('POSTGRES_DB', 'benevoclic');
  }

  get typeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.host,
      port: this.port,
      username: this.username,
      password: this.password,
      database: this.database,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true, // Set to false in production
      autoLoadEntities: true,
    };
  }
}
