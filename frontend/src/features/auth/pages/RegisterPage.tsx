import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authApi } from '../api/authApi';
import { useAuth } from '../../../context/useAuth';

export default function RegisterPage() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const result = await authApi.register({ fullName, email, password });
            signIn(result.token, {
                id: result.userId,
                fullName: result.fullName,
                email: result.email,
                role: result.role,
            });
            toast.success('Registracija je uspješna.');
            navigate('/');
        } catch {
            toast.error('Greška prilikom registracije. Email je možda već zauzet.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
            <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-xl bg-white p-8 shadow-md">
                <h1 className="mb-6 text-2xl font-semibold text-slate-800">Registracija</h1>

                <label className="mb-1 block text-sm font-medium text-slate-600">Ime i prezime</label>
                <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />

                <label className="mb-1 block text-sm font-medium text-slate-600">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />

                <label className="mb-1 block text-sm font-medium text-slate-600">Lozinka</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="mb-6 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-md bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isSubmitting ? 'Registrovanje...' : 'Registruj se'}
                </button>

                <p className="mt-4 text-center text-sm text-slate-500">
                    Već imate nalog?{' '}
                    <Link to="/prijava" className="text-indigo-600 hover:underline">
                        Prijavite se
                    </Link>
                </p>
            </form>
        </div>
    );
}