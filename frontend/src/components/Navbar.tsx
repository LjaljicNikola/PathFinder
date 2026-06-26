import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Plane, LogOut, ShieldCheck } from 'lucide-react';

export default function Navbar() {
    const { isLoggedIn, isAdmin, currentUser, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = () => {
        signOut();
        navigate('/prijava');
    };

    if (!isLoggedIn) return null;

    return (
        <nav className="bg-blue-900 shadow-lg">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-8 py-4">
                <Link to="/" className="flex items-center gap-2 text-white">
                    <Plane className="h-6 w-6 text-yellow-400" />
                    <span className="text-xl font-bold tracking-wide">PathFinder</span>
                </Link>
                <div className="flex items-center gap-4">
                    {isAdmin && (
                        <Link
                            to="/admin"
                            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-blue-200 hover:bg-blue-800 hover:text-white"
                        >
                            <ShieldCheck className="h-4 w-4" />
                            Admin
                        </Link>
                    )}
                    <span className="text-sm text-blue-200">{currentUser?.fullName}</span>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-1 rounded-md bg-yellow-400 px-3 py-1.5 text-sm font-medium text-blue-900 hover:bg-yellow-300"
                    >
                        <LogOut className="h-4 w-4" />
                        Odjava
                    </button>
                </div>
            </div>
        </nav>
    );
}