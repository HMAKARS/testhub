// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axiosInstance";
import Container from "../components/ui/Container";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const navigate = useNavigate();
    const [role, setRole] = useState("tester");


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== rePassword) {
            alert("❌ 비밀번호가 일치하지 않습니다.");
            return;
        }else if(password.length < 8){
            alert("❌ 비밀번호가는 8자리 이상 입력해주시기 바랍니다.");
            return;
        }

        try {
            await axios.post("http://localhost:8000/auth/users/", {
                username,
                password,
                re_password: rePassword,
                role,
            });
            alert("✅ 회원가입 성공! 로그인 해주세요.");
            navigate("/login");
        } catch (err) {
            const errors = err.response.data;
            if (errors.username) {
                alert("이미 사용 중인 아이디입니다.");
            } else {
                alert("회원가입 실패");
            }
        }
    };

    return (
        <Container>
            <div className="w-full bg-white dark:bg-neutral-800 p-8 sm:p-10 rounded-2xl shadow-lg border border-neutral-700">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-neutral-900 dark:text-white">
                    회원가입
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        type="text"
                        placeholder="아이디"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <div>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="tester">테스터</option>
                            <option value="admin">관리자</option>
                        </select>
                    </div>

                    <Input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Input
                        type="password"
                        placeholder="비밀번호 확인"
                        value={rePassword}
                        onChange={(e) => setRePassword(e.target.value)}
                    />
                    <Button type="submit" className="w-full">
                        회원가입
                    </Button>
                </form>
                <p className="text-sm text-center mt-4 text-gray-400 dark:text-gray-300">
                    이미 계정이 있으신가요?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                        로그인
                    </Link>
                </p>
            </div>
        </Container>
    );
}
