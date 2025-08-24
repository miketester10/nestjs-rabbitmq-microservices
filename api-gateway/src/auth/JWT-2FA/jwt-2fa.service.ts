import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';

import { User } from 'src/user/entities/user.entity';

@Injectable()
export class Jwt2faService {
  constructor(private jwtService: JwtService) {}

  async signToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
    };

    return await this.jwtService.signAsync(payload);
  }
}
