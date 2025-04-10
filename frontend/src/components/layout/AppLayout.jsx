import { Link, useLocation, useNavigate } from "react-router-dom";

export default function AppLayout({ children }) {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const menu = [
        { path: "/dashboard/ui", label: "UI 테스트" },
        { path: "/dashboard/api", label: "API 테스트" },
        { path: "/dashboard/integration", label: "통합 테스트" },
    ];

    const shouldShowMenu = pathname !== "/dashboard"; // 대시보드 메인에서는 메뉴 숨기기

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white">
            <header className="bg-white dark:bg-neutral-800 shadow px-6 py-4">
                <div className="max-w-full flex justify-between items-center">

                    {/* 좌측: 로고 */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-xl font-bold text-blue-600">
                            TestHub
                        </Link>
                    </div>

                    {/* 중앙: 메뉴 */}
                    {shouldShowMenu && (
                        <nav className="flex space-x-4">
                            {menu.map(({ path, label }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`text-sm font-medium hover:underline ${
                                        pathname === path ? "text-blue-600 font-bold" : "text-white-500"
                                    }`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>
                    )}

                    {/* 우측: 로그아웃 */}
                    <div className="flex-shrink-0">
                        <button
                            onClick={handleLogout}
                            className="text-sm text-gray-400 hover:underline"
                        >
                            로그아웃
                        </button>
                    </div>

                </div>
            </header>

            <main className="px-4 sm:px-6 py-10 max-w-5xl mx-auto">{children}</main>

            <footer className="text-center text-sm text-gray-400 py-6">
                © 2025 TestHub. 모든 권리 보유.
            </footer>
        </div>
    );
}
