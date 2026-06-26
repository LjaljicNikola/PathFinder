import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MapPin, Plus, Pencil, Trash2, Calendar, Circle } from 'lucide-react';
import { travelPlanApi } from '../api/travelPlanApi';
import type { TravelPlan } from '../types/TravelPlan';
import ConfirmationModal from '../../../components/ConfirmationModal';

export default function TravelPlansListPage() {
    const [plans, setPlans] = useState<TravelPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        planId: number | null;
        planTitle: string;
    }>({
        isOpen: false,
        planId: null,
        planTitle: '',
    });

    useEffect(() => {
        const loadPlans = async () => {
            setIsLoading(true);
            try {
                const data = await travelPlanApi.getAll();
                setPlans(data);
            } catch {
                toast.error('Greska prilikom ucitavanja planova putovanja.');
            } finally {
                setIsLoading(false);
            }
        };

        loadPlans();
    }, []);

    const handleDelete = async (id: number) => {
        try {
            await travelPlanApi.remove(id);
            toast.success('Plan putovanja je obrisan.');
            setPlans((prev) => prev.filter((p) => p.id !== id));
        } catch {
            toast.error('Greska prilikom brisanja plana.');
        }
    };

    const openDeleteModal = (id: number, title: string) => {
        setDeleteModal({
            isOpen: true,
            planId: id,
            planTitle: title,
        });
    };

    const getPlanStatus = (startDate: string, endDate: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);

        if (today < start) {
            return { status: 'Planiran', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '🟡' };
        } else if (today >= start && today <= end) {
            return { status: 'Aktivan', color: 'bg-green-100 text-green-800 border-green-300', icon: '🟢' };
        } else {
            return { status: 'Zavrsen', color: 'bg-gray-100 text-gray-600 border-gray-300', icon: '🔴' };
        }
    };

    const getDaysUntil = (targetDate: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(targetDate);
        target.setHours(0, 0, 0, 0);
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <p className="text-slate-500">Ucitavanje...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={() => {
                    if (deleteModal.planId) {
                        handleDelete(deleteModal.planId);
                    }
                }}
                title="Brisanje plana"
                message={`Da li ste sigurni da zelite obrisati plan "${deleteModal.planTitle}"?`}
                confirmText="Obrisi plan"
            />

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
                        <p className="text-lg font-medium text-slate-600">Nemate jos kreiranih planova</p>
                        <p className="mt-1 text-sm text-slate-400">Kliknite "Novi plan" da pocnete</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {plans.map((plan) => {
                            const status = getPlanStatus(plan.startDate, plan.endDate);
                            const daysUntil = getDaysUntil(plan.startDate);
                            const isActive = status.status === 'Aktivan';
                            const isPlanned = status.status === 'Planiran';
                            const isFinished = status.status === 'Zavrsen';

                            let daysText = '';
                            if (isPlanned) {
                                daysText = daysUntil === 0 ? 'Pocinje danas' : daysUntil === 1 ? 'Pocinje sutra' : `Za ${daysUntil} dana`;
                            } else if (isActive) {
                                daysText = 'Trenutno na putu';
                            } else if (isFinished) {
                                const daysAgo = Math.abs(daysUntil);
                                daysText = daysAgo === 0 ? 'Zavrseno danas' : daysAgo === 1 ? 'Zavrseno juce' : `Zavrseno prije ${daysAgo} dana`;
                            }

                            return (
                                <div
                                    key={plan.id}
                                    className={`rounded-xl border-l-4 bg-white p-5 shadow-sm transition hover:shadow-md ${status.status === 'Aktivan' ? 'border-l-green-600' :
                                            status.status === 'Planiran' ? 'border-l-yellow-500' :
                                                'border-l-gray-400'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    to={`/planovi/${plan.id}`}
                                                    className="text-lg font-semibold text-blue-900 hover:underline"
                                                >
                                                    {plan.title}
                                                </Link>
                                                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
                                                    <Circle className="h-2 w-2 fill-current" />
                                                    {status.status}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                                                <span className="flex items-center gap-1 text-slate-500">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(plan.startDate).toLocaleDateString('sr-Latn')} — {new Date(plan.endDate).toLocaleDateString('sr-Latn')}
                                                </span>
                                                <span className="text-xs font-medium text-slate-400">
                                                    {daysText}
                                                </span>
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
                                                onClick={() => openDeleteModal(plan.id, plan.title)}
                                                className="flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Obrisi
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}