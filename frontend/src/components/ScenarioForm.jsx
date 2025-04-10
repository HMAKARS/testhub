// src/components/ScenarioForm.jsx
import { useState } from "react";
import axios from "../utils/axiosInstance";
import Input from "./ui/Input";
import Button from "./ui/Button";

export default function ScenarioForm({ onRegistered }) {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [method, setMethod] = useState("GET");
    const token = localStorage.getItem("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                "http://localhost:8000/api/apitests/",
                { name, url, method },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setName("");
            setUrl("");
            setMethod("GET");
            if (onRegistered) onRegistered();
        } catch (err) {
            alert("❌ 시나리오 등록 실패");
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md border border-neutral-700">
            <h2 className="text-xl font-bold mb-4 text-neutral-900 dark:text-white">
                ➕ 테스트 시나리오 등록
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    type="text"
                    placeholder="시나리오 이름"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <Input
                    type="text"
                    placeholder="요청 URL"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <div>
                    <label className="text-sm text-gray-700 dark:text-gray-300 block mb-1">
                        요청 메서드
                    </label>
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="w-full px-4 py-2 rounded border bg-white dark:bg-neutral-700 dark:text-white"
                    >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                    </select>
                </div>
                <Button type="submit" className="w-full">
                    등록하기
                </Button>
            </form>
        </div>
    );
}
