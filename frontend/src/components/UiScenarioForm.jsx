import { useState } from "react";
import axios from "../utils/axiosInstance";

export default function UiScenarioForm({ onRegistered }) {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [selector, setSelector] = useState("");
    const token = localStorage.getItem("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8000/api/uitests/", {
                name,
                url,
                selector,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setName("");
            setUrl("");
            setSelector("");
            onRegistered();
        } catch (err) {
            console.error("시나리오 등록 실패", err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow space-y-4">
            <h2 className="text-lg font-semibold text-blue-600">📝 시나리오 등록</h2>

            <div>
                <label className="block text-sm mb-1">시나리오 이름</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border rounded text-white"
                    required
                />
            </div>

            <div>
                <label className="block text-sm mb-1">테스트 URL</label>
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3 py-2 border rounded text-white"
                    required
                />
            </div>

            <div>
                <label className="block text-sm mb-1">대상 셀렉터 (예: `#submitBtn`)</label>
                <input
                    type="text"
                    value={selector}
                    onChange={(e) => setSelector(e.target.value)}
                    className="w-full px-3 py-2 border rounded text-white"
                    required
                />
            </div>

            <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            >
                등록하기
            </button>
        </form>
    );
}
