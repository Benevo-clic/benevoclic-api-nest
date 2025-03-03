import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { TokenRefreshInterceptor } from './common/interceptors/token-refresh.interceptor';
import { UserService } from './api/user/services/user.service';
import { initializeFirebase } from '@config/firebase.config';

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

  app.use(cookieParser());

  app.enableCors({
    origin: ['http://151.80.152.63:3000', 'http://localhost:5482'], // Correction des origines
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Ajout de OPTIONS pour les requêtes preflight
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'], // Ajout des headers autorisés
  });

  // // Configuration des cookies en production
  // if (process.env.NODE_ENV === 'production') {
  //   app.enableCors({
  //     origin: [process.env.URL_FRONT, process.env.FRONTEND_URL],
  //     credentials: true,
  //   });
  // }

  app.useGlobalInterceptors(new TokenRefreshInterceptor(app.get(UserService)));

  await app.listen(3000);
}
bootstrap();
