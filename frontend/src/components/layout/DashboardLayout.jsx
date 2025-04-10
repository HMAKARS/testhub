import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function DashboardLayout({ children }) {
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white">

            <main className="px-4 py-8 max-w-5xl mx-auto">{children}</main>
        </div>
    );
}
