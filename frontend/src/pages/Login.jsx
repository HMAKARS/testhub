// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Container from "../components/ui/Container";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:8000/auth/jwt/create/", {
                username,
                password,
            });
            localStorage.setItem("token", res.data.access);
            navigate("/dashboard");
        } catch (err) {
            alert("❌ 로그인 실패: 아이디 또는 비밀번호를 확인하세요.");
        }
    };

    return (
        <Container>
            <div className="w-full bg-white dark:bg-neutral-800 p-8 sm:p-10 rounded-2xl shadow-lg border border-neutral-700">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-neutral-900 dark:text-white">
                    TestHub
                </h2>
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
                    <Button type="submit" className="w-full">
                        로그인
                    </Button>
                </form>
                <p className="text-sm text-center mt-4 text-gray-400 dark:text-gray-300">
                    계정이 없으신가요?{" "}
                    <Link to="/register" className="text-primary hover:underline">
                        회원가입
                    </Link>
                </p>
            </div>
        </Container>
    );
}
