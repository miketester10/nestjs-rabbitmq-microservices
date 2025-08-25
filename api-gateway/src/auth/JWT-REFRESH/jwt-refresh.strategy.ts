import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtRefreshPayload } from 'src/common/interfaces/jwt-payload.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtKey } from 'src/common/enums/cache-keys.enum';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: <string>configService.get('JWT_REFRESH_SECRET'),
    });
  }

  async validate(payload: JwtRefreshPayload): Promise<JwtRefreshPayload> {
    const jti = payload.jti;

    // Controllo se il refresh token è presente nella cache di Redis
    const refreshTokenFromCache = await this.cacheManager.get<string>(
      `${JwtKey.REFRESH}:${jti}`,
    );

    // Se non presente => già usato/ruotato/revocato oppure mai esistito
    if (!refreshTokenFromCache) {
      throw new UnauthorizedException('Refresh token non valido o già usato');
    }

    return payload; // Salva il payload in request.user
  }
}
