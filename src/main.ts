import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

// Suppress MongoDB MetadataLookupWarning
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'MetadataLookupWarning') {
    return; // Suppress this specific warning
  }
  console.warn(warning.name, warning.message);
});

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
      // Set proper headers for audio files
      if (
        path.endsWith('.mp3') ||
        path.endsWith('.wav') ||
        path.endsWith('.ogg') ||
        path.endsWith('.webm')
      ) {
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
      }
    },
  });

  // Then set global prefix for API routes
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: [
      'https://ielts-genius-hub.dead.uz',
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('WEB-IELTS API v1.0')
    .setDescription(
      'Comprehensive API for WEB-IELTS Platform with courses, lessons, quizzes, user management, and admin features',
    )
    .setVersion('1.0')
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
  console.log(`Docs running on http://localhost:${port}/api/docs`);
}
bootstrap();
