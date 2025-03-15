import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark a route as publicly accessible without authentication
 * @example
 * @Public()
 * @Get('login')
 * login() {}
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true); 