import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { User } from 'src/user/entities/user.entity';
import { JwtKey } from 'src/common/enums/cache-keys.enum';
import { EncryptionService } from '../encryption.service';

@Injectable()
export class JwtRefreshService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async signToken(user: User): Promise<string> {
    // Creazione del payload del refresh token
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
    };

    // Generazione del refresh token
    const refreshToken = await this.jwtService.signAsync(payload);

    // 🔐 Salva nella cache Redis il refresh token (criptato) con TTL 7 giorni
    const encryptedRefreshToken = this.encryptionService.encrypt(refreshToken);
    const ttl = 7 * 24 * 60 * 60 * 1000; // 7 giorni in ms
    await this.cacheManager.set(
      `${JwtKey.REFRESH}:${user.email}`,
      encryptedRefreshToken,
      ttl,
    );

    return refreshToken;
  }
}
