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
import SharedPlanViewPage from './features/sharing/pages/SharedPlanViewPage';
import Navbar from './components/Navbar';
import AdminPage from './features/admin/pages/AdminPage';
import CalendarPage from './features/activity/pages/CalendarPage';
import AdminUserPlansPage from './features/admin/pages/AdminUserPlansPage';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <ToastContainer position="top-right" autoClose={3000} />
                <Navbar />
                <Routes>
                    <Route path="/prijava" element={<LoginPage />} />
                    <Route path="/registracija" element={<RegisterPage />} />
                    <Route path="/deljeno/:token" element={<SharedPlanViewPage />} />
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
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <AdminPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="*"
                        element={
                            <Navigate to="/" replace />
                        }
                    />
                    <Route
                        path="/planovi/:id/kalendar"
                        element={
                            <ProtectedRoute>
                                <CalendarPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/korisnici/:userId/:fullName/planovi"
                        element={
                            <ProtectedRoute>
                                <AdminUserPlansPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;