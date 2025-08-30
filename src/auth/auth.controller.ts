import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
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
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Validation error / Bad Request' })
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
  @ApiOperation({ summary: 'Login with email or phone' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        identifier: { type: 'string', example: 'john@example.com' },
        password: { type: 'string', example: 'Passw0rd!' },
      },
      required: ['identifier', 'password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns access token',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body('identifier') identifier: string, // email OR phone
    @Body('password') password: string,
  ) {
    return this.authService.login(identifier, password);
  }
}
