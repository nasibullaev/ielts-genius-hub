import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(identifier: string, password: string): Promise<any> {
    const user =
      (await this.usersService.findByEmail(identifier)) ||
      (await this.usersService.findByPhone(identifier));

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(identifier: string, password: string) {
    const user =
      (await this.usersService.findByEmail(identifier)) ||
      (await this.usersService.findByPhone(identifier));

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Remove password
    const { password: _, ...userWithoutPassword } = user;
    const payload = { sub: user._id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  async register(
    name: string,
    email: string,
    phone: string,
    password: string,
    role = 'student',
  ) {
    const newUser = await this.usersService.create(
      name,
      email,
      phone,
      password,
      role,
    );

    // Convert mongoose doc to plain object if possible
    const userObj = (newUser as any).toObject
      ? (newUser as any).toObject()
      : newUser;
    // generate access token
    const { password: _, ...result } = userObj;
    const payload = { sub: result._id, role: result.role };
    const access_token = this.jwtService.sign(payload);

    return { result, access_token };
  }
}
