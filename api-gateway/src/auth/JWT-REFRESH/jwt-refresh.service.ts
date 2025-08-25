import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtRefreshPayload } from 'src/common/interfaces/jwt-payload.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { User } from 'src/user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { JwtKey } from 'src/common/enums/cache-keys.enum';

@Injectable()
export class JwtRefreshService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private jwtService: JwtService,
  ) {}

  async signToken(user: User): Promise<string> {
    // jti = identificatore univoco del *singolo* refresh token
    const jti = uuidv4();

    // Creazione del payload del refresh token
    const payload: JwtRefreshPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      jti,
    };

    // Generazione del refresh token
    const refreshToken = await this.jwtService.signAsync(payload);

    // 🔐 Salva nella cache Redis il refresh "attivo" con TTL 7 giorni
    const ttl = 7 * 24 * 60 * 60 * 1000; // 7 giorni in ms
    await this.cacheManager.set(`${JwtKey.REFRESH}:${jti}`, refreshToken, ttl);

    return refreshToken;
  }
}
