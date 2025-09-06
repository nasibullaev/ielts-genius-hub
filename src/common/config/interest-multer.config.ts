import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { BadRequestException } from '@nestjs/common';

export const interestMulterConfig = {
  storage: diskStorage({
    destination: join(process.cwd(), 'uploads', 'icons'),
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      const filename = `interest-${uniqueSuffix}${ext}`;
      callback(null, filename);
    },
  }),
  fileFilter: (req, file, callback) => {
    const allowedMimes = ['image/svg+xml'];
    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new BadRequestException('Only SVG files are allowed'), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024, // 1MB limit
  },
};
