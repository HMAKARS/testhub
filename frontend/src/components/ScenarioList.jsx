// src/components/ScenarioList.jsx
import { useEffect, useState } from "react";

export default function ScenarioList() {
    const [scenarios, setScenarios] = useState([]);
    const [results, setResults] = useState({});
    const [runningId, setRunningId] = useState(null);

    // 임시 시나리오 데이터
    useEffect(() => {
        setScenarios([
            {
                id: 1,
                name: "출력 버튼 테스트",
                platform: "web",
                action: "click",
                target: "#print-btn",
                assertion: { type: "text_present", value: "출력 완료" }
            },
            {
                id: 2,
                name: "로그인 버튼 동작 확인",
                platform: "web",
                action: "click",
                target: "#login-btn",
                assertion: { type: "element_visible", value: "#dashboard" }
            }
        ]);
    }, []);

    // 더미 실행 함수
    const runTest = async (id) => {
        setRunningId(id);
        try {
            const res = await axios.post(
                `http://localhost:8000/api/apitests/${id}/run/`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setResults((prev) => ({ ...prev, [id]: res.data }));
        } catch (err) {
            console.error("실행 실패", err);
            setResults((prev) => ({
                ...prev,
                [id]: { is_success: false, error: "실패" },
            }));
        } finally {
            setRunningId(null);
        }
    };

    return (
        <div className="mt-10">
            <h2 className="text-xl font-bold mb-4">📋 테스트 시나리오 목록</h2>
            {scenarios.length === 0 ? (
                <p className="text-sm text-gray-500">등록된 시나리오가 없습니다.</p>
            ) : (
                <ul className="space-y-4">
                    {scenarios.map((s) => (
                        <li key={s.id} className="p-4 border rounded shadow">
                            <div className="flex justify-between items-center">
                                <div>
                                    <strong>{s.name}</strong>
                                    <p className="text-sm text-gray-500">
                                        [{s.platform}] {s.action} → {s.target}
                                    </p>
                                </div>
                                <button
                                    onClick={() => runTest(s.id)}
                                    disabled={runningId === s.id}
                                    className="bg-blue-600 text-white px-4 py-1 rounded text-sm"
                                >
                                    {runningId === s.id ? "실행 중..." : "실행"}
                                </button>
                            </div>

                            {results[s.id] && (
                                <div className="mt-3 text-sm">
                                    <p>✅ 결과: <strong>{results[s.id].is_success ? "성공" : "실패"}</strong></p>
                                    <p>Status: {results[s.id].status_code}</p>
                                    <pre className="bg-gray-100 p-2 rounded overflow-x-auto max-h-32">
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
