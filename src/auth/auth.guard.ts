import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly authHeaderSecret: string = this.configService.get('AUTH_HEADER_SECRET');
  constructor(private configService: ConfigService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.auth;
    return authHeader === this.authHeaderSecret;
  }
}
