import { useState } from "react";
import axios from "../utils/axiosInstance";

export default function E2EUploader() {
    const [file, setFile] = useState(null);
    const [projectName, setProjectName] = useState("");
    const [analyzeResult, setAnalyzeResult] = useState(null);
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");

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
            const { project_name } = res.data.projectName;
            setProjectName(res.data.projectName);
            setMessage("✅ 업로드 및 압축 해제 성공");

            // ✅ 업로드 성공하면 자동 분석 트리거
            handleAnalyze(res.data.projectName);

        } catch (err) {
            console.error(err);
            setMessage("❌ 업로드 실패");
        }
    };


    const handleAnalyze = async (name = projectName) => {
        if (!name) return alert("프로젝트를 먼저 업로드하세요");

        try {
            const res = await axios.post("http://localhost:8000/api/e2e/analyze/", {
                project_name: name,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setAnalyzeResult(res.data);
            console.log(res.data)

            setMessage("✅ 분석 완료");

        } catch (err) {
            console.error(err);
            setMessage("❌ 분석 실패");
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-6 py-10 text-sm">
            <h1 className="text-xl font-bold mb-4">📦 프로젝트 업로드 및 분석</h1>

            <input
                type="file"
                accept=".zip"
                onChange={(e) => setFile(e.target.files[0])}
                className="mb-4"
            />

            <div className="flex gap-4 mb-6">
                <button onClick={handleUpload} className="bg-blue-600 text-white px-4 py-2 rounded">
                    업로드
                </button>
            </div>

            {message && <p className="mb-4 text-gray-500">{message}</p>}

            {analyzeResult && (
                <div className="bg-white dark:bg-neutral-800 p-4 rounded shadow text-sm space-y-2">
                    <h2 className="text-lg font-semibold mb-2">📊 분석 결과</h2>
                    <p><strong>프로젝트 이름:</strong> {analyzeResult.project}</p>
                    <p><strong>프론트엔드:</strong> {analyzeResult.frontend?.type || "감지 안됨"}</p>
                    <p><strong>백엔드:</strong> {analyzeResult.backend?.type || "감지 안됨"}</p>

                    {analyzeResult.frontend?.entry && (
                        <div>
                            <p className="mt-2 font-medium">📂 프론트엔드 엔트리 파일:</p>
                            <ul className="list-disc list-inside text-gray-500">
                                {analyzeResult.frontend.entry.map((f, i) => (
                                    <li key={i}>{f}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {analyzeResult.backend?.entry && (
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
        </div>
    );
}
