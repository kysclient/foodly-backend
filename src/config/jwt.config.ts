import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs('jwt', (): JwtModuleOptions => ({
  secret: process.env.JWT_SECRET || 'c9fe2e19bf6c0f6f9975e20e40ffad5b',
  signOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
}));