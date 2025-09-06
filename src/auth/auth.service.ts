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

    // Populate interests for the response
    const userWithInterests = await this.usersService.findByIdWithInterests(
      user._id.toString(),
    );

    if (!userWithInterests) {
      throw new UnauthorizedException('User not found');
    }

    // Remove password and convert to plain object
    const { password: _, ...userWithoutPassword } = (
      userWithInterests as any
    ).toObject();
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

    // Convert mongoose doc to plain object and remove password
    const userObj = (newUser as any).toObject();
    const { password: _, ...result } = userObj;
    const payload = { sub: result._id, role: result.role };
    const access_token = this.jwtService.sign(payload);

    return { result, access_token };
  }
}
