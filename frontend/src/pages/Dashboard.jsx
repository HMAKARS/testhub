// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ScenarioForm from "../components/ScenarioForm";
import ScenarioList from "../components/ScenarioList";

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get("http://localhost:8000/auth/users/me/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(res.data);
            } catch (err) {
                console.error("인증 실패", err);
                localStorage.removeItem("token");
                navigate("/login");
            }
        };

        if (token) fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
                    🧪 테스트 대시보드
                </h1>
                <button
                    onClick={handleLogout}
                    className="text-sm text-white bg-red-500 hover:bg-red-600 px-4 py-1 rounded"
                >
                    로그아웃
                </button>
            </div>

            {user && (
                <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md border border-neutral-700 mb-8">
                    <p className="text-lg">
                        👋 <strong className="text-primary">{user.username}</strong> 님, 환영합니다.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        테스트 시나리오를 등록하거나 실행해보세요.
                    </p>
                </div>
            )}

            <div className="space-y-10">
                <ScenarioForm />
                <ScenarioList />
            </div>
        </div>
    );
}
