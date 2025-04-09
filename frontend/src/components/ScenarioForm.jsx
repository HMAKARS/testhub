import { useState } from "react";

export default function ScenarioForm({ onRegistered }) {
    const [form, setForm] = useState({
        name: "",
        platform: "web",
        action: "click",
        target: "",
        assertionType: "text_present",
        assertionValue: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const scenarioData = {
            name: form.name,
            platform: form.platform,
            action: form.action,
            target: form.target,
            assertion: {
                type: form.assertionType,
                value: form.assertionValue
            }
        };

        console.log("등록된 시나리오:", scenarioData);
        alert("시나리오가 등록되었습니다. (백엔드 연동 전)");
        setForm({
            name: "",
            platform: "web",
            action: "click",
            target: "",
            assertionType: "text_present",
            assertionValue: "",
        });

        if (onRegistered) onRegistered(); // 목록 새로고침
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white border shadow p-4 rounded space-y-3 mb-8">
            <h2 className="text-lg font-semibold">📝 테스트 시나리오 등록</h2>

            <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="시나리오 이름"
                className="w-full border p-2 rounded"
            />

            <select
                name="platform"
                value={form.platform}
                onChange={handleChange}
                className="w-full border p-2 rounded"
            >
                <option value="web">🌐 Web</option>
                <option value="mobile">📱 Mobile</option>
                <option value="desktop">💻 Desktop</option>
            </select>

            <input
                type="text"
                name="action"
                value={form.action}
                onChange={handleChange}
                placeholder="액션 (예: click, input 등)"
                className="w-full border p-2 rounded"
            />

            <input
                type="text"
                name="target"
                value={form.target}
                onChange={handleChange}
                placeholder="대상 선택자 (예: #login-button)"
                className="w-full border p-2 rounded"
            />

            <div className="flex gap-2">
                <select
                    name="assertionType"
                    value={form.assertionType}
                    onChange={handleChange}
                    className="w-1/2 border p-2 rounded"
                >
                    <option value="text_present">텍스트 포함</option>
                    <option value="element_visible">요소 존재</option>
                </select>
                <input
                    type="text"
                    name="assertionValue"
                    value={form.assertionValue}
                    onChange={handleChange}
                    placeholder="검증 값 (예: 출력 완료)"
                    className="w-1/2 border p-2 rounded"
                />
            </div>

            <button
                type="submit"
                className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
            >
                등록하기
            </button>
        </form>
    );
}
