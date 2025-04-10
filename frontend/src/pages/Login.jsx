import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";
import { useAuth } from "../contexts/AuthContext";
import Container from "../components/ui/Container";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner"; // ✅ 추가

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false); // ✅ 로딩 상태 추가

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await axios.post("http://localhost:8000/auth/jwt/create/", {
                username,
                password,
            });
            login(res.data.access);
            navigate("/dashboard");
        } catch (err) {
            alert("아이디 혹은 비밀번호를 확인해주세요.");
        }finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <div className="bg-zinc-900 text-white p-8 rounded-xl shadow-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-center">로그인</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="text"
                        placeholder="아이디"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
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
