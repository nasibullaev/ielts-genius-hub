import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AppService } from './app.service';
import { join } from 'path';

@ApiExcludeController()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-static')
  testStatic() {
    const uploadsPath = join(process.cwd(), 'uploads');
    const coursesPath = join(uploadsPath, 'courses');

    return {
      message: 'Static files test',
      currentWorkingDir: process.cwd(),
      uploadsPath,
      coursesPath,
      staticFilesUrl: '/uploads/courses/',
      example: 'Try accessing: /uploads/courses/your-image-name.jpg',
    };
  }
}
