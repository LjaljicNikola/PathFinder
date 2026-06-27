import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Users, Shield, Mail, Calendar, Trash2, UserCog, User, Crown } from 'lucide-react';
import accountApi from '../../../api/accountApi';
import { useAuth } from '../../../context/useAuth';

interface User {
    id: number;
    fullName: string;
    email: string;
    role: string;
    registeredOn: string;
}

export default function AdminPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { currentUser } = useAuth();

    const loadUsers = async () => {
        try {
            const response = await accountApi.get<User[]>('/admin/users');
            setUsers(response.data);
        } catch {
            toast.error('Greška prilikom učitavanja korisnika.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line
        loadUsers();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Obrisati korisnika?')) return;
        try {
            await accountApi.delete(`/admin/users/${id}`);
            toast.success('Korisnik je obrisan.');
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch {
            toast.error('Greška prilikom brisanja korisnika.');
        }
    };

    const handleChangeRole = async (id: number, currentRole: string) => {
        if (id === currentUser?.id && currentRole === 'Admin') {
            toast.warning('Ne možete ukloniti Admin ulogu sa sopstvenog naloga.');
            return;
        }
        const newRole = currentRole === 'Admin' ? 'Korisnik' : 'Admin';
        try {
            await accountApi.put(`/admin/users/${id}/role`, { role: newRole });
            toast.success('Uloga je promijenjena.');
            setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: newRole } : u));
        } catch {
            toast.error('Greška prilikom promjene uloge.');
        }
    };

    // Helper funkcije za plural
    const getUsersCountText = (count: number) => {
        if (count === 1) return '1 korisnik';
        return `${count} korisnika`;
    };

    const getAdminsCountText = (count: number) => {
        if (count === 1) return '1 admin';
        return `${count} admina`;
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-700 border-t-transparent"></div>
                    <p className="text-sm text-slate-500">Učitavanje korisnika...</p>
                </div>
            </div>
        );
    }

    const adminCount = users.filter(u => u.role === 'Admin').length;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-6xl px-8 py-10">
                {/* Back button */}
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" /> Nazad na početnu
                </button>

                {/* Header */}
                <div className="mb-6 rounded-xl border-l-4 border-blue-700 bg-white p-6 shadow-sm">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="flex items-center gap-2 text-2xl font-bold text-blue-900">
                                <Users className="h-7 w-7 text-yellow-500" />
                                Upravljanje korisnicima
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Pregled i upravljanje svim korisnicima sistema
                            </p>
                        </div>
                        
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border-l-4 border-blue-700 bg-white shadow-sm">
                    {users.length === 0 ? (
                        <div className="p-8 text-center">
                            <Users className="mx-auto h-12 w-12 text-slate-300" />
                            <p className="mt-2 text-sm text-slate-500">Nema registrovanih korisnika</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-slate-200 bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <User className="h-3 w-3" />
                                                Ime
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                Email
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Shield className="h-3 w-3" />
                                                Uloga
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                Registrovan
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                            Akcije
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.map((u) => (
                                        <tr key={u.id} className="transition-colors hover:bg-slate-50">
                                            <td className="px-4 py-3 font-medium text-slate-800">
                                                <button
                                                    onClick={() => navigate(`/admin/korisnici/${u.id}/${encodeURIComponent(u.fullName)}/planovi`)}
                                                    className="text-blue-700 hover:underline"
                                                >
                                                    {u.fullName}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-slate-500">{u.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${u.role === 'Admin'
                                                        ? 'bg-indigo-100 text-indigo-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {u.role === 'Admin' ? (
                                                        <Crown className="h-3 w-3" />
                                                    ) : (
                                                        <User className="h-3 w-3" />
                                                    )}
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500">
                                                {new Date(u.registeredOn).toLocaleDateString('sr-Latn', {
                                                    day: '2-digit',
                                                    month: '2-digit',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <button
                                                        onClick={() => handleChangeRole(u.id, u.role)}
                                                        className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                                                    >
                                                        <UserCog className="h-3 w-3" />
                                                        {u.role === 'Admin' ? 'Ukloni Admina' : 'Postavi za Admina'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100"
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                        Obriši
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer stats */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>👥 {getUsersCountText(users.length)}</span>
                        <span>👑 {getAdminsCountText(adminCount)}</span>
                        <span>📅 Zadnje ažuriranje: {new Date().toLocaleDateString('sr-Latn')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Shield className="h-3 w-3" />
                        Admin panel
                    </div>
                </div>
            </div>
        </div>
    );
}