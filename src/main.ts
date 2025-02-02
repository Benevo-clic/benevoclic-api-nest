import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { initializeFirebase } from './config/firebase.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('User Authentication')
    .setDescription('The API details for the User Authentication Demo application.')
    .setVersion('1.0')
    .addTag('Authentication')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Initialize Firebase
  initializeFirebase();

  await app.listen(3000);
}
bootstrap();
