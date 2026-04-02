import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.usuario.findFirst({
      where: { email, deletedAt: null },
      include: { roles: { include: { rol: true } } },
    });

    if (!user || !user.passwordHash) return null;

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return null;

    return {
      id: user.id,
      email: user.email,
      roles: user.roles.map((ur) => ur.rol.nombre),
    };
  }

  async login(user: any) {
    if (!user) throw new UnauthorizedException();

    try {
      const payload = { sub: user.id, email: user.email, roles: user.roles };
      return {
        access_token: this.jwtService.sign(payload),
        user,
      };
    } catch (error) {
      throw new InternalServerErrorException('Error generando token');
    }
  }

  async verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}

