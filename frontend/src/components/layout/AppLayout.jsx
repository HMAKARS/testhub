export default function AppLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-neutral-900 text-gray-800 dark:text-white flex flex-col">
            <header className="bg-white dark:bg-neutral-800 shadow px-4 sm:px-6 py-4">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Link to="/" className="text-xl font-bold text-blue-600">TestHub</Link>
                    <div className="text-sm space-x-4">
                        <Link to="/dashboard" className="hover:underline">대시보드</Link>
                        <Link to="/login" className="hover:underline">로그인</Link>
                        <Link to="/register" className="hover:underline">회원가입</Link>
                    </div>
                </div>
            </header>

            {/* ✅ 핵심 수정: flex-1 추가 */}
            <main className="flex-1 px-4 sm:px-6 py-10 max-w-3xl mx-auto w-full">
                {children}
            </main>

            <footer className="text-center text-sm text-gray-400 py-6">
                © 2025 TestHub. 모든 권리 보유.
            </footer>
        </div>
    );
}
