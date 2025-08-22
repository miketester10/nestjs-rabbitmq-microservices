// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { ConfigService } from '@nestjs/config';
// import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
// import { UserService } from 'src/user/user.service';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
//   constructor(
//     private readonly configService: ConfigService,
//     private readonly userService: UserService,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: <string>configService.get('JWT_SECRET'),
//     });
//   }

//   async validate(payload: JwtPayload): Promise<JwtPayload> {
//     await this.userService.findOne(payload.sub); // check if user exits.
//     return payload;
//   }
// }
