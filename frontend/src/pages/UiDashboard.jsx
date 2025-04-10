// src/pages/UiDashboard.jsx
import { useState, useEffect } from "react";
import axios from "../utils/axiosInstance";
import UiScenarioForm from "../components/UiScenarioForm";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function UiDashboard() {
    const [scenarios, setScenarios] = useState([]);
    const [results, setResults] = useState({});
    const [runningId, setRunningId] = useState(null);
    const [logs, setLogs] = useState({});
    const [summary, setSummary] = useState(null);
    const token = localStorage.getItem("token");

    const fetchScenarios = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/uitests/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setScenarios(res.data);
        } catch (err) {
            console.error("UI 테스트 시나리오 불러오기 실패", err);
        }
    };

    const fetchSummary = async () => {
        try {
            const res = await axios.get("http://localhost:8000/api/uitests/results/summary/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSummary(res.data);
        } catch (err) {
            console.error("요약 통계 불러오기 실패", err);
        }
    };

    useEffect(() => {
        fetchScenarios();
        fetchSummary();
    }, []);

    const runScenario = async (id) => {
        setRunningId(id);
        try {
            const res = await axios.post(`http://localhost:8000/api/uitests/${id}/run/`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setResults((prev) => ({
                ...prev,
                [id]: {
                    is_success: res.data.is_success,
                    time_taken: res.data.time_taken,
                    result: res.data.result,
                },
            }));

            setLogs((prev) => ({
                ...prev,
                [id]: res.data.log || "실행 로그 없음",
            }));
        } catch (err) {
            setResults((prev) => ({
                ...prev,
                [id]: {
                    is_success: false,
                    time_taken: null,
                    result: "실패",
                },
            }));
        } finally {
            setRunningId(null);
            fetchSummary(); // 실행 후 통계도 갱신
        }
    };

    const runAll = () => {
        scenarios.forEach((s) => runScenario(s.id));
    };

    const chartData = {
        labels: summary?.daily?.map((d) => d.day) || [],
        datasets: [
            {
                label: "일별 실행 수",
                data: summary?.daily?.map((d) => d.count) || [],
                backgroundColor: "#3b82f6",
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 text-gray-900 dark:text-white px-4 sm:px-6 py-10 max-w-5xl mx-auto">
            <header className="text-center mb-6">
                <h1 className="text-2xl font-bold text-blue-600">🧪 UI 테스트 대시보드</h1>
                <p className="text-sm text-gray-500 mt-1">
                    버튼 클릭, 입력 폼 등 프론트엔드 기능 요소를 테스트합니다.
                </p>
            </header>

            <UiScenarioForm onRegistered={fetchScenarios} />

            {summary && (
                <section className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow space-y-4 mt-8">
                    <h2 className="text-lg font-semibold">실행 통계</h2>
                    <p className="text-sm">
                        전체: {summary.total} / 성공: {summary.success} / 실패: {summary.fail}
                    </p>
                    <Bar data={chartData} />
                </section>
            )}

            <section className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow space-y-4 mt-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">등록된 시나리오</h2>
                    <button
                        onClick={runAll}
                        className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                        disabled={runningId !== null}
                    >
                        전체 실행
                    </button>
                </div>

                {scenarios.length === 0 ? (
                    <p className="text-sm text-gray-500">아직 등록된 시나리오가 없습니다.</p>
                ) : (
                    <ul className="space-y-3">
                        {scenarios.map((scenario) => (
                            <li
                                key={scenario.id}
                                className="border p-4 rounded flex flex-col gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{scenario.name}</p>
                                        <p className="text-sm text-gray-500">
                                            URL: {scenario.url} | 대상 요소: {scenario.selector}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => runScenario(scenario.id)}
                                        disabled={runningId !== null}
                                        className={`text-sm px-3 py-1 rounded ${
                                            runningId === scenario.id
                                                ? "bg-gray-400 cursor-not-allowed"
                                                : "bg-blue-600 hover:bg-blue-700 text-white"
                                        }`}
                                    >
                                        {runningId === scenario.id ? "실행 중..." : "실행"}
                                    </button>
                                </div>

                                {results[scenario.id] && (
                                    <div className="text-sm mt-2 bg-gray-100 dark:bg-neutral-800 p-2 rounded">
                                        <p>✅ 결과: <strong>{results[scenario.id].is_success ? "성공" : "실패"}</strong></p>
                                        <p>🕐 소요 시간: {results[scenario.id].time_taken || "측정 안됨"}초</p>
                                        <p>📋 메시지: {results[scenario.id].result}</p>
                                        {logs[scenario.id] && (
                                            <pre className="bg-black text-green-300 p-2 mt-2 rounded text-xs max-h-40 overflow-y-auto">
                        {logs[scenario.id]}
                      </pre>
                                        )}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
