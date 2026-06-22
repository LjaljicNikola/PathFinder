import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Navbar() {
    const { isLoggedIn, isAdmin, currentUser, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = () => {
        signOut();
        navigate('/prijava');
    };

    if (!isLoggedIn) return null;

    return (
        <nav className="bg-white shadow-sm">
            <div className="mx-auto flex max-w-4xl items-center justify-between px-8 py-4">
                <Link to="/" className="text-lg font-semibold text-indigo-600">
                    PathFinder
                </Link>
                <div className="flex items-center gap-4">
                    {isAdmin && (
                        <Link to="/admin" className="text-sm text-slate-600 hover:text-indigo-600">
                            Admin
                        </Link>
                    )}
                    <span className="text-sm text-slate-500">{currentUser?.fullName}</span>
                    <button
                        onClick={handleSignOut}
                        className="rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
                    >
                        Odjava
                    </button>
                </div>
            </div>
        </nav>
    );
}