import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MapPin, Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import { travelPlanApi } from '../api/travelPlanApi';
import type { TravelPlan } from '../types/TravelPlan';

export default function TravelPlansListPage() {
    const [plans, setPlans] = useState<TravelPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadPlans = async () => {
        setIsLoading(true);
        try {
            const data = await travelPlanApi.getAll();
            setPlans(data);
        } catch {
            toast.error('Greška prilikom učitavanja planova putovanja.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadPlans();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Da li sigurno želite obrisati ovaj plan putovanja?')) return;
        try {
            await travelPlanApi.remove(id);
            toast.success('Plan putovanja je obrisan.');
            setPlans((prev) => prev.filter((p) => p.id !== id));
        } catch {
            toast.error('Greška prilikom brisanja plana.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <p className="text-slate-500">Učitavanje...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-4xl px-8 py-10">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-blue-900">Moja putovanja</h1>
                        <p className="mt-1 text-sm text-slate-500">{plans.length} {plans.length === 1 ? 'plan' : plans.length >= 5 ? 'planova' : 'plana'} putovanja</p>
                    </div>
                    <Link
                        to="/planovi/novi"
                        className="flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2.5 font-medium text-blue-900 hover:bg-yellow-300"
                    >
                        <Plus className="h-4 w-4" />
                        Novi plan
                    </Link>
                </div>

                {plans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl bg-white py-20 shadow-sm">
                        <MapPin className="mb-4 h-12 w-12 text-blue-200" />
                        <p className="text-lg font-medium text-slate-600">Nemate još kreiranih planova</p>
                        <p className="mt-1 text-sm text-slate-400">Kliknite "Novi plan" da počnete</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className="rounded-xl border-l-4 border-blue-700 bg-white p-5 shadow-sm transition hover:shadow-md"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <Link
                                            to={`/planovi/${plan.id}`}
                                            className="text-lg font-semibold text-blue-900 hover:underline"
                                        >
                                            {plan.title}
                                        </Link>
                                        <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(plan.startDate).toLocaleDateString('sr-Latn')} — {new Date(plan.endDate).toLocaleDateString('sr-Latn')}
                                        </div>
                                        {plan.description && (
                                            <p className="mt-2 text-sm text-slate-600">{plan.description}</p>
                                        )}
                                    </div>
                                    <div className="ml-4 flex gap-2">
                                        <Link
                                            to={`/planovi/${plan.id}/izmena`}
                                            className="flex items-center gap-1 rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            Izmeni
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(plan.id)}
                                            className="flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Obriši
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}