import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { travelPlanApi } from '../api/travelPlanApi';
import type { TravelPlanOverview } from '../types/TravelPlanOverview';
import AddDestinationForm from '../../destination/components/AddDestinationForm';
import { destinationApi } from '../../destination/api/destinationApi';
import AddActivityForm from '../../activity/components/AddActivityForm';
import { activityApi } from '../../activity/api/activityApi';
import AddExpenseForm from '../../expense/components/AddExpenseForm';
import { expenseApi } from '../../expense/api/expenseApi';
import AddChecklistItemForm from '../../checklist/components/AddChecklistItemForm';
import { checklistApi } from '../../checklist/api/checklistApi';
import tripApi from '../../../api/tripApi';
import SharePanel from '../../sharing/components/SharePanel';
import { useAuth } from '../../../context/useAuth';
import EditDestinationForm from '../../destination/components/EditDestinationForm';
import EditActivityForm from '../../activity/components/EditActivityForm';
import EditExpenseForm from '../../expense/components/EditExpenseForm';

export default function TravelPlanDetailPage() {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const [overview, setOverview] = useState<TravelPlanOverview | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editingDestinationId, setEditingDestinationId] = useState<number | null>(null);
    const [editingActivityId, setEditingActivityId] = useState<number | null>(null);
    const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
    

    const loadOverview = async () => {
        try {
            const data = await travelPlanApi.getOverview(Number(id));
            setOverview(data);
        } catch {
            toast.error('Greška prilikom učitavanja plana.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line
        void loadOverview();
    }, [id]);

    const handleDownloadPdf = async () => {
        try {
            const response = await tripApi.get(`/travel-plans/${plan.id}/pdf`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `PutniPlan_${plan.title}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            toast.error('Greška prilikom preuzimanja PDF izvještaja.');
        }
    };

    const handleToggleChecklistItem = async (itemId: number, title: string, isCompleted: boolean) => {
        try {
            await checklistApi.update(itemId, { title, isCompleted: !isCompleted });
            void loadOverview();
        } catch {
            toast.error('Greška prilikom izmjene stavke.');
        }
    };

    const handleDeleteChecklistItem = async (itemId: number) => {
        try {
            await checklistApi.remove(itemId);
            void loadOverview();
        } catch {
            toast.error('Greška prilikom brisanja stavke.');
        }
    };

    const handleDeleteExpense = async (expenseId: number) => {
        if (!window.confirm('Obrisati ovaj trošak?')) return;
        try {
            await expenseApi.remove(expenseId);
            toast.success('Trošak je obrisan.');
            void loadOverview();
        } catch {
            toast.error('Greška prilikom brisanja troška.');
        }
    };
    
    const handleDeleteDestination = async (destinationId: number) => {
        if (!window.confirm('Obrisati ovu destinaciju?')) return;
        try {
            await destinationApi.remove(destinationId);
            toast.success('Destinacija je obrisana.');
            void loadOverview();
        } catch {
            toast.error('Greška prilikom brisanja destinacije.');
        }
    };

    const handleDeleteActivity = async (activityId: number) => {
        if (!window.confirm('Obrisati ovu aktivnost?')) return;
        try {
            await activityApi.remove(activityId);
            toast.success('Aktivnost je obrisana.');
            void loadOverview();
        } catch {
            toast.error('Greška prilikom brisanja aktivnosti.');
        }
    };

    if (isLoading) {
        return <div className="p-8 text-slate-500">Učitavanje...</div>;
    }

    if (!overview) {
        return <div className="p-8 text-slate-500">Plan nije pronađen.</div>;
    }

    const { plan, destinations, expenses, budget, checklistItems } = overview;
    const isOwner = currentUser?.id === plan.userId;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-4xl">
                <Link to="/" className="mb-4 inline-block text-sm text-indigo-600 hover:underline">
                    ← Nazad na listu
                </Link>

                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                        <h1 className="text-2xl font-semibold text-slate-800">{plan.title}</h1>
                        <button
                            onClick={handleDownloadPdf}
                            className="rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
                        >
                            Preuzmi PDF
                        </button>
                        <Link
                            to={`/planovi/${plan.id}/kalendar`}
                            className="rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
                        >
                            Kalendar
                        </Link>
                    </div>
                    <p className="text-sm text-slate-500">
                        {new Date(plan.startDate).toLocaleDateString('sr-Latn')} - {new Date(plan.endDate).toLocaleDateString('sr-Latn')}
                    </p>
                    <p className="mt-2 text-slate-600">{plan.description}</p>
                    {plan.notes && <p className="mt-2 text-sm text-slate-500 italic">Napomena: {plan.notes}</p>}
                </div>

                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-lg font-semibold text-slate-800">Budžet</h2>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xs text-slate-500">Planirano</p>
                            <p className="text-xl font-semibold text-slate-800">{budget.plannedBudget.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Potrošeno</p>
                            <p className="text-xl font-semibold text-red-600">{budget.totalSpent.toFixed(2)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Preostalo</p>
                            <p className="text-xl font-semibold text-green-600">{budget.remainingBudget.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-lg font-semibold text-slate-800">Destinacije</h2>
                    <AddDestinationForm travelPlanId={plan.id} onAdded={loadOverview} />
                    {destinations.length === 0 ? (
                        <p className="text-sm text-slate-500">Nema dodanih destinacija.</p>
                    ) : (
                        <div className="space-y-4">
                            {destinations.map((d) => (
                                <div key={d.destination.id} className="rounded-md border border-slate-200 p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-slate-800">{d.destination.name} ({d.destination.location})</p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(d.destination.arrivalDate).toLocaleDateString('sr-Latn')} - {new Date(d.destination.departureDate).toLocaleDateString('sr-Latn')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteDestination(d.destination.id)}
                                            className="text-xs text-red-600 hover:underline"
                                        >
                                            Obriši
                                        </button>
                                        <button
                                            onClick={() => setEditingDestinationId(d.destination.id)}
                                            className="text-xs text-indigo-600 hover:underline"
                                        >
                                            Izmeni
                                        </button>
                                    </div>
                                    {editingDestinationId === d.destination.id && (
                                        <EditDestinationForm
                                            destination={d.destination}
                                            onSaved={() => { setEditingDestinationId(null); void loadOverview(); }}
                                            onCancel={() => setEditingDestinationId(null)}
                                        />
                                    )}
                                    {d.activities.length > 0 && (
                                        <ul className="mt-2 space-y-1 pl-4 text-sm text-slate-600">
                                            {d.activities.map((a) => (
                                                <li key={a.id} className="flex items-center justify-between">
                                                    <span>• {a.name} — {new Date(a.date).toLocaleDateString('sr-Latn')} ({a.status})</span>
                                                    <button
                                                        onClick={() => handleDeleteActivity(a.id)}
                                                        className="text-xs text-red-600 hover:underline"
                                                    >
                                                        Obriši
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingActivityId(a.id)}
                                                        className="text-xs text-indigo-600 hover:underline"
                                                    >
                                                        Izmeni
                                                    </button>
                                                    {editingActivityId === a.id && (
                                                        <EditActivityForm
                                                            activity={a}
                                                            onSaved={() => { setEditingActivityId(null); void loadOverview(); }}
                                                            onCancel={() => setEditingActivityId(null)}
                                                        />
                                                    )}
                                                </li>
                                                    
                                            ))}
                                        </ul>

                                    )}
                                    
                                    <AddActivityForm destinationId={d.destination.id} onAdded={loadOverview} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-lg font-semibold text-slate-800">Troškovi</h2>
                    <AddExpenseForm travelPlanId={plan.id} remainingBudget={budget.remainingBudget} onAdded={loadOverview} />
                    {expenses.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-500">Nema evidentiranih troškova.</p>
                    ) : (
                        <ul className="mt-3 space-y-1 text-sm text-slate-600">
                            {expenses.map((e) => (
                                <li key={e.id} className="flex flex-col">
                                    <div className="flex items-center justify-between">
                                        <span>{e.name} ({e.category})</span>
                                        <span className="flex items-center gap-2">
                                            {e.amount.toFixed(2)}
                                            <button onClick={() => setEditingExpenseId(e.id)} className="text-xs text-indigo-600 hover:underline">
                                                Izmijeni
                                            </button>
                                            <button onClick={() => handleDeleteExpense(e.id)} className="text-xs text-red-600 hover:underline">
                                                Obriši
                                            </button>
                                        </span>
                                    </div>
                                    {editingExpenseId === e.id && (
                                        <EditExpenseForm
                                            expense={e}
                                            onSaved={() => { setEditingExpenseId(null); void loadOverview(); }}
                                            onCancel={() => setEditingExpenseId(null)}
                                        />
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-lg font-semibold text-slate-800">Checklist</h2>
                    <AddChecklistItemForm travelPlanId={plan.id} onAdded={loadOverview} />
                    {checklistItems.length === 0 ? (
                        <p className="text-sm text-slate-500">Nema stavki na checklisti.</p>
                    ) : (
                        <ul className="space-y-1 text-sm text-slate-600">
                            {checklistItems.map((c) => (
                                <li key={c.id} className="flex items-center justify-between">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={c.isCompleted}
                                            onChange={() => handleToggleChecklistItem(c.id, c.title, c.isCompleted)}
                                        />
                                        <span className={c.isCompleted ? 'line-through text-slate-400' : ''}>{c.title}</span>
                                    </label>
                                    <button onClick={() => handleDeleteChecklistItem(c.id)} className="text-xs text-red-600 hover:underline">
                                        Obriši
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {isOwner && (
                    <div className="mt-6">
                        <SharePanel travelPlanId={plan.id} />
                    </div>
                )}
            </div>
        </div>
    );
}