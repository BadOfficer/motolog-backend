import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt.interface';
import { ConfigService } from '@nestjs/config';
import { SignUpDto } from './dto/sign-up.dto';
import type { AuthUser } from './interfaces/auth-user.interface';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly JWT_SECRET;
  private readonly JWT_ACCESS_TTL;
  private readonly JWT_REFRESH_TTL;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_SECRET = configService.getOrThrow<string>('JWT_SECRET');
    this.JWT_ACCESS_TTL = configService.getOrThrow<string>('JWT_ACCESS_TTL');
    this.JWT_REFRESH_TTL = configService.getOrThrow<string>('JWT_REFRESH_TTL');
  }

  private generateTokens(id: string) {
    const payload: JwtPayload = { id };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_ACCESS_TTL,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_REFRESH_TTL,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async validate(id: string): Promise<AuthUser> {
    const user = await this.usersService.findUserById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async signUp(signUpDto: SignUpDto) {
    const user = await this.usersService.createUser(signUpDto);

    return this.generateTokens(user.id);
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.usersService.findUserByEmail(signInDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(
      signInDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id);
  }

  async refreshTokens(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findUserById(payload.id);

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    return this.generateTokens(user.id);
  }
}
