import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import TravelPlansListPage from './features/travel-plan/pages/TravelPlanListPage';
import TravelPlanFormPage from './features/travel-plan/pages/TravelPlanFormPage';
import TravelPlanDetailPage from './features/travel-plan/pages/TravelPlanDetailPage';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <ToastContainer position="top-right" autoClose={3000} />
                <Routes>
                    <Route path="/prijava" element={<LoginPage />} />
                    <Route path="/registracija" element={<RegisterPage />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <TravelPlansListPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/planovi/novi"
                        element={
                            <ProtectedRoute>
                                <TravelPlanFormPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/planovi/:id/izmena"
                        element={
                            <ProtectedRoute>
                                <TravelPlanFormPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/planovi/:id"
                        element={
                            <ProtectedRoute>
                                <TravelPlanDetailPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;