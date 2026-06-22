import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import accountApi from '../../../api/accountApi';

interface User {
    id: number;
    fullName: string;
    email: string;
    role: string;
    registeredOn: string;
}

export default function AdminPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
        const newRole = currentRole === 'Admin' ? 'Korisnik' : 'Admin';
        try {
            await accountApi.put(`/admin/users/${id}/role`, { role: newRole });
            toast.success('Uloga je promijenjena.');
            setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: newRole } : u));
        } catch {
            toast.error('Greška prilikom promjene uloge.');
        }
    };

    if (isLoading) {
        return <div className="p-8 text-slate-500">Učitavanje...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-6 text-2xl font-semibold text-slate-800">Admin — Upravljanje korisnicima</h1>
                <div className="rounded-xl bg-white shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="border-b border-slate-200 text-left text-xs text-slate-500">
                            <tr>
                                <th className="px-4 py-3">Ime</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Uloga</th>
                                <th className="px-4 py-3">Registrovan</th>
                                <th className="px-4 py-3">Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="border-b border-slate-100 last:border-0">
                                    <td className="px-4 py-3">{u.fullName}</td>
                                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded px-2 py-0.5 text-xs ${u.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        {new Date(u.registeredOn).toLocaleDateString('sr-Latn')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleChangeRole(u.id, u.role)}
                                                className="text-xs text-indigo-600 hover:underline"
                                            >
                                                {u.role === 'Admin' ? 'Ukloni Admin' : 'Postavi Admin'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                className="text-xs text-red-600 hover:underline"
                                            >
                                                Obriši
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}