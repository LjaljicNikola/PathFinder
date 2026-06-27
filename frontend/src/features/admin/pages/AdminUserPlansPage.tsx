import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, MapPin, Pencil } from 'lucide-react';
import tripApi from '../../../api/tripApi';

interface TravelPlan {
    id: number;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    plannedBudget: number;
}

export default function AdminUserPlansPage() {
    const { userId, fullName } = useParams();
    const navigate = useNavigate();
    const [plans, setPlans] = useState<TravelPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        tripApi.get<TravelPlan[]>(`/travel-plans/user/${userId}`)
            .then((r) => setPlans(r.data))
            .catch(() => toast.error('Greška prilikom učitavanja planova.'))
            .finally(() => setIsLoading(false));
    }, [userId]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-700 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-6xl px-8 py-10">
                <button
                    onClick={() => navigate('/admin')}
                    className="mb-6 inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" /> Nazad na listu korisnika
                </button>

                <div className="mb-6 rounded-xl border-l-4 border-blue-700 bg-white p-6 shadow-sm">
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-blue-900">
                        <MapPin className="h-7 w-7 text-yellow-500" />
                        Planovi korisnika: {decodeURIComponent(fullName ?? '')}
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Pregled i izmena planova putovanja
                    </p>
                </div>

                {plans.length === 0 ? (
                    <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                        <MapPin className="mx-auto h-12 w-12 text-slate-300" />
                        <p className="mt-2 text-sm text-slate-500">Korisnik nema planova putovanja</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-xl border-l-4 border-blue-700 bg-white shadow-sm">
                        <table className="w-full text-sm">
                            <thead className="border-b border-slate-200 bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Naziv</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Opis</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Početak</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Kraj</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Budžet</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Akcije</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {plans.map((plan) => (
                                    <tr key={plan.id} className="transition-colors hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-800">{plan.title}</td>
                                        <td className="px-4 py-3 text-slate-500">{plan.description || '—'}</td>
                                        <td className="px-4 py-3 text-xs text-slate-500">
                                            {new Date(plan.startDate).toLocaleDateString('sr-Latn')}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500">
                                            {new Date(plan.endDate).toLocaleDateString('sr-Latn')}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{plan.plannedBudget} €</td>
                                        <td className="px-4 py-3">
                                            <button
                                                onClick={() => navigate(`/planovi/${plan.id}/izmena`, {
                                                    state: { returnTo: `/admin/korisnici/${userId}/${fullName}/planovi` }
                                                })}
                                                className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                                            >
                                                <Pencil className="h-3 w-3" />
                                                Izmeni
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}