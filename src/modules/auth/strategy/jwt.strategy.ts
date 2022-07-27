import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Implementing JWT strategy for authentication.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  /**
   * Constructor.
   *
   * @param {ConfigService} configService - `ConfigService`.
   */
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('jwt').secret,
    });
  }

  /**
   * Convert payload from JWT to UserJwt type.
   *
   * @param {UserJwtPayload} payload - incoming payload.
   * @returns {UserJwt} - Decoded data from JWT.
   */
  validate(payload: UserJwtPayload): UserJwt {
    return { id: payload.sub, email: payload.email };
  }
}
