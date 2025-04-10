import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UiDashboard from "./pages/UiDashboard";
import ApiDashboard from "./pages/ApiDashboard";
import IntegrationDashboard from "./pages/IntegrationDashboard";
import AppLayout from "./components/layout/AppLayout";

function App() {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    const hideLayoutRoutes = ["/login", "/register"];
    const isLayoutHidden = hideLayoutRoutes.includes(location.pathname);

    if (isLoading) {
        return null; // 로딩 스피너를 원하면 Spinner 컴포넌트 반환 가능
    }

    return (
        <Routes>
            {/* 로그인/회원가입은 AppLayout 없이 렌더링 */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 나머지는 AppLayout 내부에서 렌더링 */}
            <Route
                path="*"
                element={
                    isLayoutHidden ? null : (
                        <AppLayout>
                            <Routes>
                                <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
                                <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
                                <Route path="/dashboard/ui" element={isAuthenticated ? <UiDashboard /> : <Navigate to="/login" />} />
                                <Route path="/dashboard/api" element={isAuthenticated ? <ApiDashboard /> : <Navigate to="/login" />} />
                                <Route path="/dashboard/integration" element={isAuthenticated ? <IntegrationDashboard /> : <Navigate to="/login" />} />
                            </Routes>
                        </AppLayout>
                    )
                }
            />
        </Routes>
    );
}

export default App;
