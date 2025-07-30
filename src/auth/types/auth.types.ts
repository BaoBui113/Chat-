import { Request } from 'express';

// Interface để định nghĩa payload JWT
export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Interface để mở rộng Request với user property
export interface RequestWithUser extends Request {
  user: JwtPayload;
}
