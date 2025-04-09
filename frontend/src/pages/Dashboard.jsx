// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Spinner from "../components/ui/Spinner"; // Spinner 컴포넌트 가져오기

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scenarios, setScenarios] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchUserAndScenarios = async () => {
            try {
                const userRes = await axios.get("http://localhost:8000/auth/users/me/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(userRes.data);

                const scenariosRes = await axios.get("http://localhost:8000/api/apitests/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setScenarios(scenariosRes.data);
            } catch (err) {
                console.error("인증 실패", err);
                localStorage.removeItem("token");
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchUserAndScenarios();
    }, [token, navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <div className="max-w-2xl mx-auto mt-20 p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">대시보드</h1>
                <button
                    className="text-sm text-gray-500 underline"
                    onClick={handleLogout}
                >
                    로그아웃
                </button>
            </div>

            {loading ? (
                <Spinner />
            ) : (
                <>
                    {user && (
                        <div className="bg-white shadow p-4 rounded border mb-6">
                            <p>👋 {user.username} 님 환영합니다.</p>
                            <p className="text-sm text-gray-500">테스트 시나리오를 등록하거나 실행해보세요.</p>
                        </div>
                    )}

                    <div>
                        <h2 className="text-xl font-bold mb-4">📋 테스트 시나리오 목록</h2>
                        {scenarios.length === 0 ? (
                            <p className="text-sm text-gray-500">등록된 시나리오가 없습니다.</p>
                        ) : (
                            <ul>
                                {scenarios.map((scenario) => (
                                    <li key={scenario.id} className="p-4 border rounded shadow mb-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <strong>{scenario.name}</strong>
                                                <p className="text-sm text-gray-500">{scenario.method} {scenario.url}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
