import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files FIRST (no /api prefix)
  // Use process.cwd() for production builds
  const uploadsPath = join(process.cwd(), 'uploads');
  console.log('Serving static files from:', uploadsPath);

  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads/',
    setHeaders: (res, path) => {
      // Set proper headers for images
      if (
        path.endsWith('.jpg') ||
        path.endsWith('.jpeg') ||
        path.endsWith('.png') ||
        path.endsWith('.webp')
      ) {
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
      }
    },
  });

  // Then set global prefix for API routes
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: [
      process.env.CORS_ORIGIN || 'https://ielts-genius-hub.dead.uz',
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('IELTS Genius Hub API')
    .setDescription(
      'Comprehensive API for IELTS Preparation Platform with courses, lessons, quizzes, user management, and admin features',
    )
    .setVersion('2.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User profile and interests management')
    .addTag('courses', 'Course management and enrollment')
    .addTag('lessons', 'Lesson content and quiz functionality')
    .addTag('admin', 'Administrative functions and content management')
    .addTag('payments', 'Payment processing and subscription management')
    .addTag('level-checker', 'IELTS level assessment and evaluation')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}
bootstrap();
