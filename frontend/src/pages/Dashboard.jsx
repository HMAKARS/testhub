// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScenarioForm from "../components/ScenarioForm";
import ScenarioList from "../components/ScenarioList";
import axios from "axios";

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // 나중에 Django 연동 예정
                const mockUser = { username: "테스트유저" };
                setUser(mockUser);
            } catch (err) {
                localStorage.removeItem("token");
                navigate("/login");
            }
        };

        if (token) fetchUser();
        else navigate("/login");
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="max-w-3xl mx-auto mt-20 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">테스트 대시보드</h1>
                <button
                    className="text-sm text-gray-500 underline"
                    onClick={handleLogout}
                >
                    로그아웃
                </button>
            </div>

            {user ? (
                <>
                    <div className="bg-white shadow p-4 rounded border mb-6">
                        <p>👋 <strong>{user.username}</strong> 님 환영합니다.</p>
                        <p className="text-sm text-gray-500">
                            테스트 시나리오를 등록하거나 실행해보세요.
                        </p>
                    </div>

                    <ScenarioForm />
                    <ScenarioList />
                </>
            ) : (
                <p>사용자 정보를 불러오는 중...</p>
            )}
        </div>
    );
}
