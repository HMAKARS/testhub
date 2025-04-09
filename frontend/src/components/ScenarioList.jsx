// src/components/ScenarioList.jsx
import { useEffect, useState } from "react";
import axios from "axios";

export default function ScenarioList() {
    const [scenarios, setScenarios] = useState([]);
    const [runningId, setRunningId] = useState(null);
    const [results, setResults] = useState({});
    const token = localStorage.getItem("token");

    const fetchScenarios = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/apitests/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setScenarios(res.data);
        } catch (err) {
            console.error("❌ 목록 불러오기 실패", err);
        }
    };

    const runTest = async (id) => {
        setRunningId(id);
        try {
            const res = await axios.post(
                `http://localhost:8000/api/apitests/${id}/run/`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setResults((prev) => ({ ...prev, [id]: res.data }));
        } catch (err) {
            setResults((prev) => ({
                ...prev,
                [id]: { is_success: false, error: "실패" },
            }));
        } finally {
            setRunningId(null);
        }
    };

    useEffect(() => {
        fetchScenarios();
    }, []);

    return (
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md border border-neutral-700">
            <h2 className="text-xl font-bold mb-6 text-neutral-900 dark:text-white">
                📋 테스트 시나리오 목록
            </h2>
            {scenarios.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    등록된 시나리오가 없습니다.
                </p>
            ) : (
                <ul className="space-y-4">
                    {scenarios.map((s) => (
                        <li
                            key={s.id}
                            className="p-4 rounded border bg-neutral-100 dark:bg-neutral-700"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">
                                        {s.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {s.method} {s.url}
                                    </p>
                                </div>
                                <button
                                    onClick={() => runTest(s.id)}
                                    disabled={runningId === s.id}
                                    className="bg-primary text-white text-sm px-4 py-1 rounded hover:opacity-90 disabled:opacity-50"
                                >
                                    {runningId === s.id ? "실행 중..." : "실행"}
                                </button>
                            </div>

                            {results[s.id] && (
                                <div className="mt-3 text-sm bg-white dark:bg-neutral-800 p-3 rounded border">
                                    <p>
                                        결과:{" "}
                                        <strong
                                            className={
                                                results[s.id].is_success ? "text-green-500" : "text-red-500"
                                            }
                                        >
                                            {results[s.id].is_success ? "성공" : "실패"}
                                        </strong>
                                    </p>
                                    <p>Status Code: {results[s.id].status_code}</p>
                                    <pre className="mt-2 bg-neutral-100 dark:bg-neutral-900 text-xs p-2 rounded overflow-x-auto max-h-40">
                    {JSON.stringify(results[s.id].response_body, null, 2)}
                  </pre>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
