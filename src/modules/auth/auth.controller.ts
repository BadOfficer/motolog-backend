import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthUser } from './interfaces/auth-user.interface';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import type { GoogleUser } from './interfaces/google-user.interface';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return user;
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    return;
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(
    @CurrentUser() googleUser: GoogleUser,
    @Res() res: Response,
  ) {
    const tokens = await this.authService.signInWithGoogle(googleUser);

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
    const redirectUrl =
      `${frontendUrl}/auth/callback` +
      `?accessToken=${encodeURIComponent(tokens.accessToken)}` +
      `&refreshToken=${encodeURIComponent(tokens.refreshToken)}`;

    return res.redirect(redirectUrl);
  }
}
