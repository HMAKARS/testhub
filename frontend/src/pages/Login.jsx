import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Container from "../components/ui/Container";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner"; // ✅ 추가

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false); // ✅ 로딩 상태 추가
    const [error, setError] = useState("");
    const navigate = useNavigate();

// Login.jsx - 로그인 성공 시
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:8000/auth/jwt/create/", {
                username,
                password,
            });
            localStorage.setItem("token", res.data.access);
            navigate("/dashboard"); // ✅ 여기에서 대시보드로 이동시킴
        } catch (err) {
            alert("로그인 실패");
        }
    };


    return (
        <Container>
            <div className="bg-zinc-900 text-white p-8 rounded-xl shadow-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>

                {error && (
                    <div className="mb-4 text-sm text-red-400 text-center">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="text"
                        placeholder="아이디"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "로그인 중..." : "로그인"}
                    </Button>
                </form>

                <p className="text-sm text-center mt-4">
                    계정이 없으신가요?{" "}
                    <Link to="/register" className="text-blue-500">
                        회원가입
                    </Link>
                </p>
            </div>
        </Container>
    );
}
