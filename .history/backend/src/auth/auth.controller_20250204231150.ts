import { Controller, Post, Body, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginData: { email: string; password: string }) {
    console.log('Login request received in controller:', loginData);
    try {
      const result = await this.authService.login(loginData);
      console.log('Login successful:', result);
      return result;
    } catch (error) {
      console.error('Login error in controller:', error);
      throw error;
    }
  }

  @Post('register')
  async register(@Body() registerData: any) {
    return this.authService.register(registerData);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
} 