import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { initializeFirebase } from '@config/firebase.config';
import { PrometheusMiddleware } from './common/middleware/prometheus.middleware';

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
  SwaggerModule.setup('swagger', app, document);

  app.enableCors({
    origin: ['http://localhost:5482', 'https://www.benevoclic.fr'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  initializeFirebase();

  const prometheusMiddleware = app.get(PrometheusMiddleware);
  app.use(prometheusMiddleware.use.bind(prometheusMiddleware));

  await app.listen(3000);
}

bootstrap();
