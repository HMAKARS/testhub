// src/components/E2EScenarioForm.jsx
import { useState } from "react";
import axios from "../utils/axiosInstance";

export default function E2EScenarioForm({ onRegistered }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const token = localStorage.getItem("token");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8000/api/e2e/scenarios/", {
                name,
                description
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setName("");
            setDescription("");
            onRegistered();
        } catch (err) {
            console.error("등록 실패", err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3 bg-white dark:bg-neutral-800 p-4 rounded shadow">
            <div>
                <label className="block text-sm font-medium">시나리오 이름</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border px-3 py-1 rounded mt-1"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium">설명</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border px-3 py-1 rounded mt-1"
                />
            </div>
            <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
            >
                등록
            </button>
        </form>
    );
}
