import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
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
        return <div className="p-8 text-slate-500">Učitavanje...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold text-slate-800">Moji planovi putovanja</h1>
                    <Link
                        to="/planovi/novi"
                        className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
                    >
                        + Novi plan
                    </Link>
                </div>

                {plans.length === 0 ? (
                    <p className="text-slate-500">Nemate još kreiranih planova putovanja.</p>
                ) : (
                    <div className="grid gap-4">
                        {plans.map((plan) => (
                            <div key={plan.id} className="rounded-lg bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <Link to={`/planovi/${plan.id}`} className="text-lg font-medium text-indigo-700 hover:underline">
                                            {plan.title}
                                        </Link>
                                        <p className="text-sm text-slate-500">
                                            {new Date(plan.startDate).toLocaleDateString('sr-Latn')} - {new Date(plan.endDate).toLocaleDateString('sr-Latn')}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">{plan.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/planovi/${plan.id}/izmena`}
                                            className="rounded-md bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200"
                                        >
                                            Izmijeni
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(plan.id)}
                                            className="rounded-md bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100"
                                        >
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