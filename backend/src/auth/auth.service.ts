import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  async validateUser(email: string, password: string) {
    if (email === 'admin@municipio.com' && password === 'secret') {
      return { id: '1', email, roles: ['admin'] };
    }
    return null;
  }

  async login(user: any) {
    if (!user) throw new UnauthorizedException();
    const token = 'fake-jwt-token';
    return { access_token: token, user };
  }
}
