// src/pages/Dashboard.jsx
import { Link } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";

export default function Dashboard() {
    return (
        <DashboardLayout>
            <div className="text-center space-y-6">
                <h1 className="text-2xl font-bold">어떤 테스트를 진행하시겠습니까?</h1>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                    <Link to="/dashboard/ui" className="block p-6 rounded-lg shadow bg-white dark:bg-neutral-800 hover:bg-blue-50 transition">
                        <h2 className="text-lg font-semibold text-blue-600">UI 테스트</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">화면 기반의 자동 테스트를 수행합니다.</p>
                    </Link>
                    <Link to="/dashboard/e2e" className="block p-6 rounded-lg shadow bg-white dark:bg-neutral-800 hover:bg-blue-50 transition">
                        <h2 className="text-lg font-semibold text-green-600">E2E 테스트</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">REST API 자동 테스트를 수행합니다.</p>
                    </Link>
                    <Link to="/dashboard/integration" className="block p-6 rounded-lg shadow bg-white dark:bg-neutral-800 hover:bg-blue-50 transition">
                        <h2 className="text-lg font-semibold text-purple-600">통합 테스트</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-300">UI와 API를 통합하여 테스트합니다.</p>
                    </Link>
                </div>
            </div>
        </DashboardLayout>
    );
}
