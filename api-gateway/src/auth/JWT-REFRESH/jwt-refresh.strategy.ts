import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtKey } from 'src/common/enums/cache-keys.enum';
import { Request } from 'express';
import { EncryptionService } from '../encryption.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: <string>configService.get('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<JwtPayload> {
    // Estraggo il token fornito
    const extractor = ExtractJwt.fromAuthHeaderAsBearerToken();
    const refreshTokenProvided = extractor(req);

    // Controllo se il refresh token fornito è uguale a quello nella cache di Redis (criptato), se presente
    const email = payload.email;
    const encryptedRefreshTokenFromCache = await this.cacheManager.get<string>(
      `${JwtKey.REFRESH}:${email}`,
    );

    // Se non presente nella Cache => già usato oppure è stato effettuato il logout
    if (
      !encryptedRefreshTokenFromCache ||
      this.encryptionService.decrypt(encryptedRefreshTokenFromCache) !==
        refreshTokenProvided
    ) {
      throw new UnauthorizedException('Refresh token non valido');
    }

    return payload; // Salva il payload in request.user
  }
}
