import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const sessionToken =
      req.cookies.get('authjs.session-token')?.value ||
      req.cookies.get('next-auth.session-token')?.value ||
      req.cookies.get('__Secure-authjs.session-token')?.value;
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};