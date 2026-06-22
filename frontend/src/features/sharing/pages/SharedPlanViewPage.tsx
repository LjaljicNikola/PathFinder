import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { sharingApi } from '../api/sharingApi';
import publicTripApi from '../../../api/publicTripApi';
import type { TravelPlanOverview } from '../../travel-plan/types/TravelPlanOverview';
import AddDestinationForm from '../../destination/components/AddDestinationForm';
import { destinationApi } from '../../destination/api/destinationApi';
import AddActivityForm from '../../activity/components/AddActivityForm';
import { activityApi } from '../../activity/api/activityApi';
import AddExpenseForm from '../../expense/components/AddExpenseForm';
import { expenseApi } from '../../expense/api/expenseApi';
import AddChecklistItemForm from '../../checklist/components/AddChecklistItemForm';
import { checklistApi } from '../../checklist/api/checklistApi';

export default function SharedPlanViewPage() {
    const { token } = useParams();
    const [overview, setOverview] = useState<TravelPlanOverview | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [accessLevel, setAccessLevel] = useState('');
    const [travelPlanId, setTravelPlanId] = useState<number>(0);

    useEffect(() => {
        // eslint-disable-next-line
        loadSharedPlan();
    }, [token]);

    const loadSharedPlan = async () => {
        try {
            const tokenInfo = await sharingApi.checkToken(token!);
            setAccessLevel(tokenInfo.accessLevel);
            setTravelPlanId(tokenInfo.travelPlanId);

            const response = await publicTripApi.get(`/travel-plans/${tokenInfo.travelPlanId}/overview`, {
                headers: { 'X-Share-Token': token },
            });
            setOverview(response.data);
        } catch {
            setError('Link nije važeći ili je istekao.');
            toast.error('Greška prilikom učitavanja deljenog plana.');
        } finally {
            setIsLoading(false);
        }
    };

    const isEdit = accessLevel === 'Edit';

    const handleDeleteDestination = async (destinationId: number) => {
        if (!window.confirm('Obrisati ovu destinaciju?')) return;
        try {
            await destinationApi.remove(destinationId);
            toast.success('Destinacija je obrisana.');
            void loadSharedPlan();
        } catch {
            toast.error('Greška prilikom brisanja destinacije.');
        }
    };

    const handleDeleteActivity = async (activityId: number) => {
        if (!window.confirm('Obrisati ovu aktivnost?')) return;
        try {
            await activityApi.remove(activityId);
            toast.success('Aktivnost je obrisana.');
            void loadSharedPlan();
        } catch {
            toast.error('Greška prilikom brisanja aktivnosti.');
        }
    };

    const handleDeleteExpense = async (expenseId: number) => {
        if (!window.confirm('Obrisati ovaj trošak?')) return;
        try {
            await expenseApi.remove(expenseId);
            toast.success('Trošak je obrisan.');
            void loadSharedPlan();
        } catch {
            toast.error('Greška prilikom brisanja troška.');
        }
    };

    const handleDeleteChecklistItem = async (itemId: number) => {
        try {
            await checklistApi.remove(itemId);
            void loadSharedPlan();
        } catch {
            toast.error('Greška prilikom brisanja stavke.');
        }
    };

    const handleToggleChecklistItem = async (itemId: number, title: string, isCompleted: boolean) => {
        try {
            await checklistApi.update(itemId, { title, isCompleted: !isCompleted });
            void loadSharedPlan();
        } catch {
            toast.error('Greška prilikom izmjene stavke.');
        }
    };

    if (isLoading) {
        return <div className="p-8 text-slate-500">Učitavanje...</div>;
    }

    if (error || !overview) {
        return <div className="p-8 text-red-600">{error}</div>;
    }

    const { plan, destinations, expenses, budget, checklistItems } = overview;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-4 rounded-md bg-indigo-50 p-3 text-sm text-indigo-700">
                    Pregledate deljeni plan putovanja ({isEdit ? 'pravo uređivanja' : 'samo pregled'}).
                </div>

                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold text-slate-800">{plan.title}</h1>
                    <p className="text-sm text-slate-500">
                        {new Date(plan.startDate).toLocaleDateString('sr-Latn')} - {new Date(plan.endDate).toLocaleDateString('sr-Latn')}
                    </p>
                    <p className="mt-2 text-slate-600">{plan.description}</p>
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
                    {isEdit && (
                        <AddDestinationForm travelPlanId={travelPlanId} onAdded={loadSharedPlan} />
                    )}
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
                                        {isEdit && (
                                            <button
                                                onClick={() => handleDeleteDestination(d.destination.id)}
                                                className="text-xs text-red-600 hover:underline"
                                            >
                                                Obriši
                                            </button>
                                        )}
                                    </div>
                                    {d.activities.length > 0 && (
                                        <ul className="mt-2 space-y-1 pl-4 text-sm text-slate-600">
                                            {d.activities.map((a) => (
                                                <li key={a.id} className="flex items-center justify-between">
                                                    <span>• {a.name} — {new Date(a.date).toLocaleDateString('sr-Latn')} ({a.status})</span>
                                                    {isEdit && (
                                                        <button
                                                            onClick={() => handleDeleteActivity(a.id)}
                                                            className="text-xs text-red-600 hover:underline"
                                                        >
                                                            Obriši
                                                        </button>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {isEdit && (
                                        <AddActivityForm destinationId={d.destination.id} onAdded={loadSharedPlan} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-lg font-semibold text-slate-800">Troškovi</h2>
                    {isEdit && (
                        <AddExpenseForm travelPlanId={travelPlanId} remainingBudget={budget.remainingBudget} onAdded={loadSharedPlan} />
                    )}
                    {expenses.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-500">Nema evidentiranih troškova.</p>
                    ) : (
                        <ul className="mt-3 space-y-1 text-sm text-slate-600">
                            {expenses.map((e) => (
                                <li key={e.id} className="flex items-center justify-between">
                                    <span>{e.name} ({e.category})</span>
                                    <span className="flex items-center gap-2">
                                        {e.amount.toFixed(2)}
                                        {isEdit && (
                                            <button onClick={() => handleDeleteExpense(e.id)} className="text-xs text-red-600 hover:underline">
                                                Obriši
                                            </button>
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="mb-3 text-lg font-semibold text-slate-800">Checklist</h2>
                    {isEdit && (
                        <AddChecklistItemForm travelPlanId={travelPlanId} onAdded={loadSharedPlan} />
                    )}
                    {checklistItems.length === 0 ? (
                        <p className="text-sm text-slate-500">Nema stavki na checklisti.</p>
                    ) : (
                        <ul className="space-y-1 text-sm text-slate-600">
                            {checklistItems.map((c) => (
                                <li key={c.id} className="flex items-center justify-between">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        {isEdit ? (
                                            <input
                                                type="checkbox"
                                                checked={c.isCompleted}
                                                onChange={() => handleToggleChecklistItem(c.id, c.title, c.isCompleted)}
                                            />
                                        ) : (
                                            <span>{c.isCompleted ? '☑' : '☐'}</span>
                                        )}
                                        <span className={c.isCompleted ? 'line-through text-slate-400' : ''}>{c.title}</span>
                                    </label>
                                    {isEdit && (
                                        <button onClick={() => handleDeleteChecklistItem(c.id)} className="text-xs text-red-600 hover:underline">
                                            Obriši
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}