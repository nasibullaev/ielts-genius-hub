import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiProperty,
} from '@nestjs/swagger';

// Add response DTOs for documentation
export class LoginResponseDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NGY4YTEyMzQ1Njc4OTBhYmNkZWYxMjMiLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTcwNTQxNjAwMCwiZXhwIjoxNzA1NTAyNDAwfQ.example_signature',
    description: 'JWT access token for authentication',
  })
  access_token: string;

  @ApiProperty({
    example: {
      _id: '64f8a1234567890abcdef123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+998901234567',
      role: 'student',
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-15T10:30:00.000Z',
    },
    description: 'User profile information (without password)',
  })
  user: object;
}

export class RegisterResponseDto {
  @ApiProperty({
    example: {
      _id: '64f8a1234567890abcdef123',
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+998901234567',
      role: 'student',
      createdAt: '2024-01-15T10:30:00.000Z',
      updatedAt: '2024-01-15T10:30:00.000Z',
    },
    description: 'Created user profile information',
  })
  result: object;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NGY4YTEyMzQ1Njc4OTBhYmNkZWYxMjMiLCJyb2xlIjoic3R1ZGVudCIsImlhdCI6MTcwNTQxNjAwMCwiZXhwIjoxNzA1NTAyNDAwfQ.example_signature',
    description: 'JWT access token for immediate authentication',
  })
  access_token: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Creates a new user account and returns user info with access token',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john@example.com' },
        phone: { type: 'string', example: '+998901234567' },
        password: { type: 'string', example: 'Passw0rd!' },
        role: { type: 'string', example: 'student' },
      },
      required: ['name', 'email', 'phone', 'password'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: RegisterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error / Bad Request' })
  @ApiResponse({
    status: 409,
    description: 'Email or phone number already in use',
  })
  async register(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('phone') phone: string,
    @Body('password') password: string,
    @Body('role') role: string,
  ) {
    return this.authService.register(name, email, phone, password, role);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login with email or phone',
    description:
      'Authenticate user using email or phone number and password. Returns access_token for API authentication.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        identifier: {
          type: 'string',
          example: 'john@example.com',
          description: 'Email address or phone number',
        },
        password: {
          type: 'string',
          example: 'Passw0rd!',
          description: 'User password',
        },
      },
      required: ['identifier', 'password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns access token',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 401, description: 'User not found' })
  async login(
    @Body('identifier') identifier: string, // email OR phone
    @Body('password') password: string,
  ) {
    return this.authService.login(identifier, password);
  }
}
