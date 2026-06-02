# Kin — AI Dating Platform

## 서비스 개요
AI가 사용자의 페르소나를 생성하고, 상대방 페르소나와 시뮬레이션 대화를 통해
호환도를 검증해주는 진지한 만남 플랫폼. 결과 무료 공개, 메시지 전송 시 10,000원 과금.

## 기술 스택
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Database: PostgreSQL + Prisma ORM v6 (v7은 driver adapter 강제라 다운그레이드함)
- LLM: OpenRouter API → DeepSeek V3 (model: deepseek/deepseek-chat-v3-0324:free)
- Payment: Toss Payments
- Auth: 자체 구현 (email + password + JWT)

## 환경변수 (.env 하나로 통합 — Prisma CLI + Next.js 모두 읽음)
- `.env.local` / `prisma.config.ts` 사용 안 함. 모든 변수는 `.env`에.
- schema.prisma 는 `url = env("DATABASE_URL")` 직접 사용 (Prisma 6 방식)

## 개발 규칙
- TypeScript strict mode 사용
- 모든 API 에러 처리 필수 (try-catch)
- Zod로 모든 API 입력값 검증
- 환경변수: .env.local 사용
- 한 번에 하나의 기능만 구현
- 에러 수정 시 무엇을 바꿨는지 한 줄 요약

## 개발 순서 (Sprint)
1. 프로젝트 셋업 + DB 연결 ✅
2. Auth (가입/로그인)
3. Survey (설문 15개 저장)
4. AI Chat + Persona 생성 (핵심)
5. Matching + Simulation
6. Payment + Messaging
7. Waitlist 랜딩 + 배포

## DB 스키마 요약
- User: 기본 정보 + 상태 (onboarding/active/waitlist)
- Survey: 설문 15개 답변
- ChatSession: AI 채팅 기록 (JSON)
- Persona: AI 생성 페르소나 JSON + 사용자 확인 여부
- Match: 매칭 결과 + 시뮬레이션 + 관심 표시 + 잠금 여부
- Message: 채팅 메시지
- Payment: 결제 기록

## 핵심 플로우
가입 → 설문(15개) → AI 채팅(10분) → 페르소나 확인/수정 → 매칭 결과 확인 →
관심 표시(양방향) → 결제(10,000원) → 메시지 전송 → 연락처 교환

## LLM 사용 규칙
- OpenRouter API base URL: https://openrouter.ai/api/v1
- 페르소나 생성: 최대 600토큰
- 시뮬레이션: 왕복 3~5회, 최대 3000토큰
- 개인정보 발설 금지 guardrail 필수

## 동성 매칭
- 이성 매칭만 지원 (MVP)
- gender 필드는 DB에 유지 (향후 확장용)
- 매칭 필터에서 반대 성별만 조회

## 콜드 스타트 전략
- 가짜 프로필 없음
- 같은 지역 50명 모이면 일괄 매칭 오픈
- 그 전까지: "매칭 상대 모집 중 — 알림 받기" UI 표시

## 환경변수 목록 (전부 .env 에)
- DATABASE_URL: PostgreSQL 연결 문자열
- OPENROUTER_API_KEY: OpenRouter API 키
- JWT_SECRET: JWT 서명 시크릿 (최소 32자, 일반 유저 전용)
- ADMIN_JWT_SECRET: 어드민 전용 JWT 시크릿 (JWT_SECRET과 반드시 다른 값)
- ADMIN_PASSWORD: 어드민 로그인 비밀번호 (평문, 영문+숫자+특수문자 조합)
- TOSS_SECRET_KEY: Toss Payments 시크릿 키
- NEXT_PUBLIC_APP_URL: 앱 URL (예: http://localhost:3000)
