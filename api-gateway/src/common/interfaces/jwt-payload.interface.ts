export interface JwtPayload {
  sub: number;
  email: string;
  firstName: string;
}

export interface JwtRefreshPayload extends JwtPayload {
  jti: string; // JWT ID per token rotation
}
