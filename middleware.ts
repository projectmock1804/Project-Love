import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_API_PATHS = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/admin/login',
  '/api/images/celebrity/',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // ── Admin 페이지 보호 (서버사이드) ──────────────────────────
  // /admin/login 제외한 모든 /admin/* 경로는 쿠키로 인증 확인
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminCookie = request.cookies.get('kinAdmin');
    if (!adminCookie?.value) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // ── API 라우트 보호 ─────────────────────────────────────────
  if (!pathname.startsWith('/api/')) return NextResponse.next();
  if (PUBLIC_API_PATHS.some(p => pathname.startsWith(p))) return NextResponse.next();

  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ') || auth.length < 20) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
};
