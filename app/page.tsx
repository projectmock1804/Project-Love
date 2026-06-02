import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl font-bold text-stone-900 tracking-tight">Kin</h1>
        <p className="mt-4 text-xl text-stone-700 font-semibold max-w-sm leading-snug">
          AI가 당신 대신 먼저 대화해보고,
          <br />
          잘 맞는 사람만 추천해드려요.
        </p>
        <p className="mt-2 text-sm text-stone-400 max-w-xs">
          불필요한 만남 없이, 검증된 인연만
        </p>

        <div className="mt-10 flex flex-col gap-3 w-full max-w-xs">
          <Link
            href="/signup"
            className="w-full py-3 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-700 transition text-center"
          >
            무료로 시작하기
          </Link>
          <Link
            href="/login"
            className="w-full py-3 border border-stone-300 text-stone-700 rounded-xl font-medium hover:bg-stone-100 transition text-center"
          >
            로그인
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-3 gap-4 max-w-sm w-full">
          <div className="bg-white rounded-2xl p-4 border border-stone-200">
            <div className="text-2xl mb-2">🤝</div>
            <p className="text-xs text-stone-500 leading-relaxed">AI가 당신의<br />성격을 파악</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-200">
            <div className="text-2xl mb-2">💬</div>
            <p className="text-xs text-stone-500 leading-relaxed">AI끼리<br />미리 대화</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-stone-200">
            <div className="text-2xl mb-2">✨</div>
            <p className="text-xs text-stone-500 leading-relaxed">검증된 상대만<br />소개</p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-stone-400">
        © 2026 Kin · 진지한 만남을 위한 AI 매칭
      </footer>
    </div>
  );
}
