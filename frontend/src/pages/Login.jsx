// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // 실제 백엔드 API는 추후 연동
            // 임시로 토큰 저장 후 대시보드 이동
            localStorage.setItem("token", "mock_token");
            navigate("/dashboard");
        } catch (err) {
            alert("로그인 실패");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
                <h1 className="text-2xl font-bold text-center mb-6">로그인</h1>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        className="w-full border p-3 rounded-lg text-sm"
                        type="text"
                        placeholder="아이디"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        className="w-full border p-3 rounded-lg text-sm"
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        로그인
                    </button>
                </form>
                <p className="text-center text-sm text-gray-500 mt-4">
                    아직 계정이 없으신가요?{" "}
                    <a href="/register" className="text-blue-600 underline">
                        회원가입
                    </a>
                </p>
            </div>
        </div>
    );
}
