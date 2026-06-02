/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      // CORS는 middleware.ts에서 처리 — 여기서 중복 설정하지 않음
      // 보안 헤더만 전역 적용
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};
export default nextConfig;
