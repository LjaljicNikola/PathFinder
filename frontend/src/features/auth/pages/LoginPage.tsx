import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plane } from 'lucide-react';
import { authApi } from '../api/authApi';
import { useAuth } from '../../../context/useAuth';
import { useLocation } from 'react-router-dom';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await authApi.login({ email, password });
            signIn(result.token, {
                id: result.userId,
                fullName: result.fullName,
                email: result.email,
                role: result.role,
            });
            toast.success('Uspješno ste se prijavili.');
            const params = new URLSearchParams(location.search);
            const returnTo = params.get('returnTo');
            navigate(returnTo || '/');
        } catch {
            toast.error('Pogrešan email ili lozinka.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            <div className="hidden w-1/2 flex-col items-center justify-center bg-blue-900 p-12 lg:flex">
                <Plane className="mb-6 h-20 w-20 text-yellow-400" />
                <h1 className="mb-4 text-4xl font-bold text-white">PathFinder</h1>
                <p className="text-center text-lg text-blue-200">
                    Planirajte putovanja na jednom mestu. Destinacije, aktivnosti, budžet i još mnogo toga.
                </p>
            </div>

            <div className="flex w-full flex-col items-center justify-center bg-slate-50 p-8 lg:w-1/2">
                <div className="w-full max-w-sm">
                    <div className="mb-8 flex items-center gap-2 lg:hidden">
                        <Plane className="h-7 w-7 text-blue-900" />
                        <span className="text-2xl font-bold text-blue-900">PathFinder</span>
                    </div>

                    <h2 className="mb-2 text-2xl font-semibold text-slate-800">Dobro došli nazad</h2>
                    <p className="mb-6 text-sm text-slate-500">Prijavite se na vaš nalog</p>

                    <form onSubmit={handleSubmit}>
                        <label className="mb-1 block text-sm font-medium text-slate-600">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="vas@email.com"
                            className="mb-4 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />

                        <label className="mb-1 block text-sm font-medium text-slate-600">Lozinka</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="mb-6 w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-lg bg-blue-900 py-2.5 font-medium text-white hover:bg-blue-800 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Prijavljivanje...' : 'Prijavi se'}
                        </button>
                    </form>

                    <p className="mt-4 text-center text-sm text-slate-500">
                        Nemate nalog?{' '}
                        <Link to="/registracija" className="font-medium text-blue-700 hover:underline">
                            Registrujte se
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}