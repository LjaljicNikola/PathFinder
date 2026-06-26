import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    ArrowLeft,
    MapPin,
    Calendar,
    DollarSign,
    CheckSquare,
    Users,
    Eye,
    Edit,
    Trash2,
    AlertCircle
} from 'lucide-react';
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

const STATUS_COLORS: Record<string, string> = {
    Planned: 'bg-blue-100 text-blue-700',
    Booked: 'bg-sky-100 text-sky-700',
    Completed: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
    Planned: 'Planirano',
    Booked: 'Rezervisano',
    Completed: 'Završeno',
    Cancelled: 'Otkazano',
};

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
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-700 border-t-transparent"></div>
                    <p className="text-sm text-slate-500">Učitavanje deljenog plana...</p>
                </div>
            </div>
        );
    }

    if (error || !overview) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="max-w-md rounded-xl border-l-4 border-red-500 bg-white p-8 shadow-sm">
                    <div className="flex items-center gap-3 text-red-600">
                        <AlertCircle className="h-8 w-8" />
                        <div>
                            <h2 className="text-lg font-semibold">Greška</h2>
                            <p className="text-sm text-slate-600">{error}</p>
                        </div>
                    </div>
                    <Link
                        to="/"
                        className="mt-4 inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" /> Nazad na početnu
                    </Link>
                </div>
            </div>
        );
    }

    const { plan, destinations, expenses, budget, checklistItems } = overview;

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-6xl px-8 py-10">
                {/* Back button */}
                <Link
                    to="/"
                    className="mb-6 inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" /> Nazad na početnu
                </Link>

                {/* Access level banner */}
                <div className={`mb-6 rounded-xl border-l-4 p-4 shadow-sm ${isEdit
                        ? 'border-green-700 bg-green-50'
                        : 'border-blue-700 bg-blue-50'
                    }`}>
                    <div className="flex items-center gap-3">
                        {isEdit ? (
                            <Edit className="h-5 w-5 text-green-700" />
                        ) : (
                            <Eye className="h-5 w-5 text-blue-700" />
                        )}
                        <div>
                            <p className={`text-sm font-medium ${isEdit ? 'text-green-800' : 'text-blue-800'
                                }`}>
                                {isEdit ? '🔓 Imate pravo uredjivanja' : '👁️ Pregledate deljeni plan'}
                            </p>
                            <p className={`text-xs ${isEdit ? 'text-green-600' : 'text-blue-600'
                                }`}>
                                {isEdit
                                    ? 'Možete dodavati, menjati i brisati sadržaj plana'
                                    : 'Imate samo pregled plana putovanja'}
                            </p>
                            {isEdit && (
                                <p className="mt-1 text-xs text-green-600">
                                    Niste prijavljeni?{' '}
                                    <Link to={`/prijava?returnTo=/deljeno/${token}`} className="underline font-medium">
                                        Prijavite se
                                    </Link>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Header */}
                <div className="mb-6 rounded-xl border-l-4 border-blue-700 bg-white p-6 shadow-sm">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="flex items-center gap-2 text-2xl font-bold text-blue-900">
                                <MapPin className="h-7 w-7 text-yellow-500" />
                                {plan.title}
                            </h1>
                            <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                                <Calendar className="h-4 w-4" />
                                {new Date(plan.startDate).toLocaleDateString('sr-Latn')} — {new Date(plan.endDate).toLocaleDateString('sr-Latn')}
                            </div>
                            {plan.description && (
                                <p className="mt-2 text-slate-600">{plan.description}</p>
                            )}
                            {plan.notes && (
                                <p className="mt-1 text-sm italic text-slate-400">Napomena: {plan.notes}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                                <Users className="h-3 w-3" />
                                Deljeni plan
                            </span>
                        </div>
                    </div>
                </div>

                {/* Budget */}
                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-blue-100 border-l-4 border-l-blue-700">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900">
                        <DollarSign className="h-5 w-5 text-yellow-500" /> Budžet
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-lg bg-blue-50 p-4 text-center">
                            <p className="text-xs text-slate-500">Planirano</p>
                            <p className="mt-1 text-xl font-bold text-blue-900">{budget.plannedBudget.toFixed(2)}</p>
                        </div>
                        <div className="rounded-lg bg-red-50 p-4 text-center">
                            <p className="text-xs text-slate-500">Potrošeno</p>
                            <p className="mt-1 text-xl font-bold text-red-600">{budget.totalSpent.toFixed(2)}</p>
                        </div>
                        <div className="rounded-lg bg-green-50 p-4 text-center">
                            <p className="text-xs text-slate-500">Preostalo</p>
                            <p className="mt-1 text-xl font-bold text-green-600">{budget.remainingBudget.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Destinations */}
                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-blue-100 border-l-4 border-l-blue-700">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900">
                        <MapPin className="h-5 w-5 text-yellow-500" /> Destinacije
                    </h2>
                    {isEdit && (
                        <AddDestinationForm travelPlanId={travelPlanId} onAdded={loadSharedPlan} />
                    )}
                    {destinations.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-400">Nema dodanih destinacija.</p>
                    ) : (
                        <div className="mt-4 space-y-4">
                            {destinations.map((d) => (
                                <div key={d.destination.id} className="rounded-lg border border-slate-200 p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-800">
                                                {d.destination.name}
                                                <span className="ml-1 text-sm font-normal text-slate-500">
                                                    ({d.destination.location})
                                                </span>
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {new Date(d.destination.arrivalDate).toLocaleDateString('sr-Latn')} — {new Date(d.destination.departureDate).toLocaleDateString('sr-Latn')}
                                            </p>
                                        </div>
                                        {isEdit && (
                                            <button
                                                onClick={() => handleDeleteDestination(d.destination.id)}
                                                className="flex items-center gap-1 text-xs text-red-600 hover:underline"
                                            >
                                                <Trash2 className="h-3 w-3" /> Obriši
                                            </button>
                                        )}
                                    </div>
                                    {d.activities.length > 0 && (
                                        <ul className="mt-3 space-y-2 pl-2">
                                            {d.activities.map((a) => (
                                                <li key={a.id} className="flex flex-col rounded-md bg-slate-50 p-2">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-medium text-slate-700">{a.name}</span>
                                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[a.status] || 'bg-slate-100 text-slate-600'}`}>
                                                                {STATUS_LABELS[a.status] || a.status}
                                                            </span>
                                                        </div>
                                                        {isEdit && (
                                                            <button
                                                                onClick={() => handleDeleteActivity(a.id)}
                                                                className="flex items-center gap-1 text-xs text-red-600 hover:underline"
                                                            >
                                                                <Trash2 className="h-3 w-3" /> Obriši
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-400">
                                                        {new Date(a.date).toLocaleDateString('sr-Latn')} • {a.location}
                                                    </p>
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

                {/* Expenses */}
                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-blue-100 border-l-4 border-l-blue-700">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900">
                        <DollarSign className="h-5 w-5 text-yellow-500" /> Troškovi
                    </h2>
                    {isEdit && (
                        <AddExpenseForm travelPlanId={travelPlanId} remainingBudget={budget.remainingBudget} onAdded={loadSharedPlan} />
                    )}
                    {expenses.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-400">Nema evidentiranih troškova.</p>
                    ) : (
                        <ul className="mt-3 space-y-2">
                            {expenses.map((e) => (
                                <li key={e.id} className="flex flex-col rounded-md bg-slate-50 p-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm font-medium text-slate-700">{e.name}</span>
                                            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{e.category}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-slate-700">{e.amount.toFixed(2)}</span>
                                            {isEdit && (
                                                <button
                                                    onClick={() => handleDeleteExpense(e.id)}
                                                    className="flex items-center gap-1 text-xs text-red-600 hover:underline"
                                                >
                                                    <Trash2 className="h-3 w-3" /> Obriši
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Checklist */}
                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-blue-100 border-l-4 border-l-blue-700">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900">
                        <CheckSquare className="h-5 w-5 text-yellow-500" /> Checklist
                    </h2>
                    {isEdit && (
                        <AddChecklistItemForm travelPlanId={travelPlanId} onAdded={loadSharedPlan} />
                    )}
                    {checklistItems.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-400">Nema stavki na checklisti.</p>
                    ) : (
                        <ul className="mt-3 space-y-2">
                            {checklistItems.map((c) => (
                                <li key={c.id} className="flex items-center justify-between rounded-md bg-slate-50 p-2">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        {isEdit ? (
                                            <input
                                                type="checkbox"
                                                checked={c.isCompleted}
                                                onChange={() => handleToggleChecklistItem(c.id, c.title, c.isCompleted)}
                                                className="h-4 w-4 accent-blue-700"
                                            />
                                        ) : (
                                            <span className="text-lg">
                                                {c.isCompleted ? '✅' : '⬜'}
                                            </span>
                                        )}
                                        <span className={c.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}>
                                            {c.title}
                                        </span>
                                    </label>
                                    {isEdit && (
                                        <button
                                            onClick={() => handleDeleteChecklistItem(c.id)}
                                            className="flex items-center gap-1 text-xs text-red-600 hover:underline"
                                        >
                                            <Trash2 className="h-3 w-3" /> Obriši
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer info */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>📋 {isEdit ? 'Uređivanje dozvoljeno' : 'Samo pregled'}</span>
                        <span>🔗 Dijeljeni plan</span>
                        <span>📅 {new Date().toLocaleDateString('sr-Latn')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Users className="h-3 w-3" />
                        Dijeljenje plana
                    </div>
                </div>
            </div>
        </div>
    );
}