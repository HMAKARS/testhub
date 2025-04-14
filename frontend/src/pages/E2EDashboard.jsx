// src/pages/E2EDashboard.jsx
import { useState } from "react";
import axios from "../utils/axiosInstance";

export default function E2EDashboard() {
    const [file, setFile] = useState(null);
    const [projectName, setProjectName] = useState("");
    const [analyzeResult, setAnalyzeResult] = useState(null);
    const [scenarios, setScenarios] = useState([]);
    const [scenarioResults, setScenarioResults] = useState({});
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");

    const handleRunScenario = async (id) => {
        try {
            const res = await axios.post(`http://localhost:8000/api/e2e/scenarios/${id}/run/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const result = res.data;
            setScenarioResults(prev => ({ ...prev, [id]: result }));

            if (result.success) {
                alert(`✅ 실행 완료`);
            } else {
                alert("⚠️ 테스트 실패 - 로그 확인 또는 보정 시도 가능");
            }
        } catch (err) {
            console.error("실행 실패", err);
            alert("❌ 실행 실패");
        }
    };

    const handleUpdateScenario = async (id, scenario) => {
        try {
            await axios.patch(`http://localhost:8000/api/e2e/scenarios/${id}/`, {
                name: scenario.name,
                steps: scenario.steps
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setMessage("✅ 시나리오 수정 완료");
        } catch (err) {
            console.error(err);
            setMessage("❌ 시나리오 수정 실패");
        }
    };

    const handleStepChange = (index, i, field, newValue) => {
        const newScenarios = [...scenarios];
        newScenarios[index].steps[i] = {
            ...newScenarios[index].steps[i],
            [field]: newValue
        };
        setScenarios(newScenarios);
    };

    const handleAddStep = (index) => {
        const newScenarios = [...scenarios];
        newScenarios[index].steps.push({ action: "", target: "", value: "" });
        setScenarios(newScenarios);
    };

    const handleRemoveStep = (index, i) => {
        const newScenarios = [...scenarios];
        newScenarios[index].steps.splice(i, 1);
        setScenarios(newScenarios);
    };

    const handleNameChange = (index, newName) => {
        const newScenarios = [...scenarios];
        newScenarios[index].name = newName;
        setScenarios(newScenarios);
    };

    const handleRegenerateScenario = async (id, failureLog) => {
        try {
            const res = await axios.post("http://localhost:8000/api/e2e/scenario/generate/", {
                project_name: projectName,
                failure_log: failureLog
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setScenarios(prev => [...prev, ...res.data.scenarios]);
            setMessage("✅ 보정된 시나리오가 생성되었습니다");
        } catch (err) {
            console.error(err);
            setMessage("❌ 보정 실패");
        }
    };

    const handleUpload = async () => {
        if (!file) return alert("파일을 선택하세요");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post("http://localhost:8000/api/e2e/upload/", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            const project = res.data.projectName;
            setProjectName(project);
            setMessage("✅ 업로드 및 압축 해제 성공");

            handleAnalyze(project);
        } catch (err) {
            console.error(err);
            setMessage("❌ 업로드 실패");
        }
    };

    const handleAnalyze = async (project) => {
        try {
            const res = await axios.post("http://localhost:8000/api/e2e/analyze/", {
                project_name: project,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setAnalyzeResult(res.data);
            setMessage("✅ 프로젝트 분석 완료");
        } catch (err) {
            console.error(err);
            setMessage("❌ 분석 실패");
        }
    };

    const generateScenario = async () => {
        try {
            const res = await axios.post("http://localhost:8000/api/e2e/scenario/generate/", {
                project_name: projectName,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setScenarios(res.data.scenarios);
            setMessage("✅ 시나리오 자동 생성 완료");
        } catch (err) {
            console.error(err);
            setMessage("❌ 시나리오 생성 실패");
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-10 text-sm">
            <h1 className="text-xl font-bold mb-4">🧠 AI 기반 E2E 테스트 대시보드</h1>

            <input
                type="file"
                accept=".zip"
                onChange={(e) => setFile(e.target.files[0])}
                className="mb-4"
            />

            <div className="flex gap-4 mb-6">
                <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2 rounded">
                    프로젝트 업로드
                </button>
                <button
                    onClick={generateScenario}
                    disabled={!projectName}
                    className="bg-green-600 text-white px-4 py-2 rounded"
                >
                    시나리오 자동 생성
                </button>
            </div>

            {message && <p className="mb-4 text-gray-500">{message}</p>}

            {analyzeResult && (
                <div className="bg-white dark:bg-neutral-800 p-4 rounded shadow text-sm space-y-2 mb-6">
                    <h2 className="text-lg font-semibold mb-2">📊 분석 결과</h2>
                    <p><strong>프로젝트 이름:</strong> {analyzeResult.project}</p>
                    <p><strong>프론트엔드:</strong> {analyzeResult.frontend?.type || "감지 안됨"}</p>
                    <p><strong>백엔드:</strong> {analyzeResult.backend?.type || "감지 안됨"}</p>

                    {analyzeResult.frontend?.entry?.length > 0 && (
                        <div>
                            <p className="mt-2 font-medium">📂 프론트엔드 엔트리 파일:</p>
                            <ul className="list-disc list-inside text-gray-500">
                                {analyzeResult.frontend.entry.map((f, i) => (
                                    <li key={i}>{f}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {analyzeResult.backend?.entry?.length > 0 && (
                        <div>
                            <p className="mt-2 font-medium">🧠 백엔드 엔트리 파일:</p>
                            <ul className="list-disc list-inside text-gray-500">
                                {analyzeResult.backend.entry.map((f, i) => (
                                    <li key={i}>{f}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {scenarios.length > 0 && (
                <div className="bg-white dark:bg-neutral-800 p-4 rounded shadow text-sm space-y-2">
                    <h2 className="text-lg font-semibold mb-2">✅ 생성된 테스트 시나리오</h2>
                    <ul className="list-disc list-inside text-gray-500 space-y-3">
                        {scenarios.map((s, index) => (
                            <li key={s.id} className="border p-4 rounded bg-neutral-100 dark:bg-neutral-700">
                                <input
                                    type="text"
                                    value={s.name}
                                    onChange={(e) => handleNameChange(index, e.target.value)}
                                    className="font-medium w-full mb-2 p-1 rounded border text-sm"
                                />

                                {s.steps.map((step, i) => (
                                    <div key={i} className="flex gap-2 mb-1 text-xs items-center">
                                        <input
                                            type="text"
                                            value={step.action || ""}
                                            onChange={(e) => handleStepChange(index, i, "action", e.target.value)}
                                            className="w-1/3 p-1 rounded border bg-white dark:bg-neutral-900"
                                        />
                                        <input
                                            type="text"
                                            value={step.target || ""}
                                            onChange={(e) => handleStepChange(index, i, "target", e.target.value)}
                                            className="w-1/3 p-1 rounded border bg-white dark:bg-neutral-900"
                                        />
                                        <input
                                            type="text"
                                            value={step.value || ""}
                                            onChange={(e) => handleStepChange(index, i, "value", e.target.value)}
                                            className="w-1/3 p-1 rounded border bg-white dark:bg-neutral-900"
                                        />
                                        <button
                                            onClick={() => handleRemoveStep(index, i)}
                                            className="text-red-500 hover:underline ml-2"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                ))}

                                <button
                                    onClick={() => handleAddStep(index)}
                                    className="text-blue-500 text-xs mt-2 hover:underline"
                                >
                                    + 단계 추가
                                </button>

                                <div className="flex gap-3 mt-3">
                                    <button
                                        onClick={() => handleUpdateScenario(s.id, s)}
                                        className="bg-yellow-600 text-white px-3 py-1 text-xs rounded"
                                    >
                                        저장
                                    </button>
                                    <button
                                        onClick={() => handleRunScenario(s.id)}
                                        className="bg-blue-600 text-white px-3 py-1 text-xs rounded"
                                    >
                                        실행
                                    </button>

                                    {scenarioResults[s.id] && !scenarioResults[s.id].success && (
                                        <button
                                            onClick={() => handleRegenerateScenario(s.id, scenarioResults[s.id].log)}
                                            className="bg-red-600 text-white px-3 py-1 text-xs rounded"
                                        >
                                            🛠 보정된 시나리오 재생성
                                        </button>
                                    )}
                                </div>

                                {scenarioResults[s.id] && (
                                    <div className="mt-3 bg-white dark:bg-neutral-900 p-3 border rounded">
                                        <p className="text-xs font-semibold mb-1">
                                            {scenarioResults[s.id].success ? "✅ 성공" : "❌ 실패"} (⏱ {scenarioResults[s.id].time_taken}s)
                                        </p>
                                        <pre className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 text-xs">
                                            {scenarioResults[s.id].log}
                                        </pre>

                                        {scenarioResults[s.id].screenshot && (
                                            <img
                                                src={scenarioResults[s.id].screenshot}
                                                alt="실패 스크린샷"
                                                className="mt-2 border rounded max-w-md"
                                            />
                                        )}
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
