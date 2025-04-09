// src/pages/Register.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== rePassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            // 실제 API 요청은 나중에 추가 예정
            alert("회원가입 완료! 로그인 페이지로 이동합니다.");
            navigate("/login");
        } catch (err) {
            alert("회원가입 실패");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
                <h1 className="text-2xl font-bold text-center mb-6">회원가입</h1>
                <form onSubmit={handleRegister} className="space-y-4">
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
                    <input
                        className="w-full border p-3 rounded-lg text-sm"
                        type="password"
                        placeholder="비밀번호 확인"
                        value={rePassword}
                        onChange={(e) => setRePassword(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                        회원가입
                    </button>
                </form>
                <p className="text-center text-sm text-gray-500 mt-4">
                    이미 계정이 있으신가요?{" "}
                    <a href="/login" className="text-blue-600 underline">
                        로그인
                    </a>
                </p>
            </div>
        </div>
    );
}
