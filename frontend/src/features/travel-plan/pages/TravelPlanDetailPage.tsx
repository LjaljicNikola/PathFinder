import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MapPin, Calendar, DollarSign, CheckSquare, FileDown, CalendarDays, ArrowLeft, Pencil, Trash2, Share2 } from 'lucide-react';
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
import ConfirmationModal from '../../../components/ConfirmationModal';

const STATUS_COLORS: Record<string, string> = {
    Planned: 'bg-blue-100 text-blue-700',
    Booked: 'bg-sky-100 text-sky-700',
    Completed: 'bg-green-100 text-green-700',
    Cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
    Planned: 'Planirano',
    Booked: 'Rezervisano',
    Completed: 'Zavrseno',
    Cancelled: 'Otkazano',
};

export default function TravelPlanDetailPage() {
    const { id } = useParams();
    const { currentUser } = useAuth();
    const [overview, setOverview] = useState<TravelPlanOverview | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editingDestinationId, setEditingDestinationId] = useState<number | null>(null);
    const [editingActivityId, setEditingActivityId] = useState<number | null>(null);
    const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        confirmText?: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
    });

    useEffect(() => {
        const loadOverview = async () => {
            try {
                const data = await travelPlanApi.getOverview(Number(id));
                setOverview(data);
            } catch {
                toast.error('Greska prilikom ucitavanja plana.');
            } finally {
                setIsLoading(false);
            }
        };

        loadOverview();
    }, [id]);

    const handleDownloadPdf = async () => {
        if (!overview) return;
        try {
            const response = await tripApi.get(`/travel-plans/${overview.plan.id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `PutniPlan_${overview.plan.title}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            toast.error('Greska prilikom preuzimanja PDF izvjestaja.');
        }
    };

    const handleToggleChecklistItem = async (itemId: number, title: string, isCompleted: boolean) => {
        try {
            await checklistApi.update(itemId, { title, isCompleted: !isCompleted });
            const data = await travelPlanApi.getOverview(Number(id));
            setOverview(data);
        } catch {
            toast.error('Greska prilikom izmjene stavke.');
        }
    };

    const handleDeleteChecklistItem = async (itemId: number) => {
        setModalConfig({
            isOpen: true,
            title: 'Brisanje stavke',
            message: 'Da li ste sigurni da zelite obrisati ovu stavku sa checkliste?',
            onConfirm: async () => {
                try {
                    await checklistApi.remove(itemId);
                    toast.success('Stavka je obrisana.');
                    const data = await travelPlanApi.getOverview(Number(id));
                    setOverview(data);
                } catch {
                    toast.error('Greska prilikom brisanja stavke.');
                }
            }
        });
    };

    const handleDeleteExpense = async (expenseId: number) => {
        setModalConfig({
            isOpen: true,
            title: 'Brisanje troška',
            message: 'Da li ste sigurni da zelite obrisati ovaj trosak?',
            onConfirm: async () => {
                try {
                    await expenseApi.remove(expenseId);
                    toast.success('Trosak je obrisan.');
                    const data = await travelPlanApi.getOverview(Number(id));
                    setOverview(data);
                } catch {
                    toast.error('Greska prilikom brisanja troška.');
                }
            }
        });
    };

    const handleDeleteDestination = async (destinationId: number) => {
        setModalConfig({
            isOpen: true,
            title: 'Brisanje destinacije',
            message: 'Da li ste sigurni da zelite obrisati ovu destinaciju?',
            onConfirm: async () => {
                try {
                    await destinationApi.remove(destinationId);
                    toast.success('Destinacija je obrisana.');
                    const data = await travelPlanApi.getOverview(Number(id));
                    setOverview(data);
                } catch {
                    toast.error('Greska prilikom brisanja destinacije.');
                }
            }
        });
    };

    const handleDeleteActivity = async (activityId: number) => {
        setModalConfig({
            isOpen: true,
            title: 'Brisanje aktivnosti',
            message: 'Da li ste sigurni da zelite obrisati ovu aktivnost?',
            onConfirm: async () => {
                try {
                    await activityApi.remove(activityId);
                    toast.success('Aktivnost je obrisana.');
                    const data = await travelPlanApi.getOverview(Number(id));
                    setOverview(data);
                } catch {
                    toast.error('Greska prilikom brisanja aktivnosti.');
                }
            }
        });
    };

    const getProgressBarColor = (percentage: number) => {
        if (percentage < 50) return 'bg-green-500';
        if (percentage < 80) return 'bg-yellow-500';
        if (percentage < 100) return 'bg-orange-500';
        return 'bg-red-600';
    };

    const getStatusText = (percentage: number) => {
        if (percentage < 50) return 'Troškovi su niski.';
        if (percentage < 80) return 'Troškovi srednje visoki.';
        if (percentage < 100) return 'Paznja, blizu limitas ste!';
        return 'Prekoracili ste limit!';
    };

    if (isLoading) return <div className="flex min-h-screen items-center justify-center text-slate-500">Ucitavanje...</div>;
    if (!overview) return <div className="flex min-h-screen items-center justify-center text-slate-500">Plan nije pronadjen.</div>;

    const { plan, destinations, expenses, budget, checklistItems } = overview;
    const isOwner = currentUser?.id === plan.userId;

    const spentPercentage = budget.plannedBudget > 0
        ? Math.min((budget.totalSpent / budget.plannedBudget) * 100, 100)
        : 0;
    const progressColor = getProgressBarColor(spentPercentage);
    const statusText = getStatusText(spentPercentage);

    return (
        <div className="min-h-screen bg-slate-50">
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText || 'Obrisi'}
            />

            <div className="mx-auto max-w-4xl px-8 py-10">
                <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-blue-700 hover:underline">
                    <ArrowLeft className="h-4 w-4" /> Nazad na listu
                </Link>

                <div className="mb-6 rounded-xl border-l-4 border-blue-700 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-blue-900">{plan.title}</h1>
                            <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                                <Calendar className="h-4 w-4" />
                                {new Date(plan.startDate).toLocaleDateString('sr-Latn')} — {new Date(plan.endDate).toLocaleDateString('sr-Latn')}
                            </div>
                            {plan.description && <p className="mt-2 text-slate-600">{plan.description}</p>}
                            {plan.notes && <p className="mt-1 text-sm italic text-slate-400">Napomena: {plan.notes}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={handleDownloadPdf}
                                className="flex items-center gap-1 rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200">
                                <FileDown className="h-4 w-4" /> PDF
                            </button>
                            <Link to={`/planovi/${plan.id}/kalendar`}
                                className="flex items-center gap-1 rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200">
                                <CalendarDays className="h-4 w-4" /> Kalendar
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-blue-100 border-l-4 border-l-blue-700">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900">
                        <DollarSign className="h-5 w-5 text-yellow-500" /> Budzet
                    </h2>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="rounded-lg bg-blue-50 p-4 text-center">
                            <p className="text-xs text-slate-500">Planirano</p>
                            <p className="mt-1 text-xl font-bold text-blue-900">{budget.plannedBudget.toFixed(2)}</p>
                        </div>
                        <div className="rounded-lg bg-red-50 p-4 text-center">
                            <p className="text-xs text-slate-500">Potroseno</p>
                            <p className="mt-1 text-xl font-bold text-red-600">{budget.totalSpent.toFixed(2)}</p>
                        </div>
                        <div className="rounded-lg bg-green-50 p-4 text-center">
                            <p className="text-xs text-slate-500">Preostalo</p>
                            <p className="mt-1 text-xl font-bold text-green-600">{budget.remainingBudget.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-700">Potroseno: {spentPercentage.toFixed(0)}%</span>
                            <span className={`text-sm font-medium ${spentPercentage < 50 ? 'text-green-600' :
                                    spentPercentage < 80 ? 'text-yellow-600' :
                                        spentPercentage < 100 ? 'text-orange-600' :
                                            'text-red-600'
                                }`}>
                                {statusText}
                            </span>
                        </div>
                        <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ease-in-out ${progressColor}`}
                                style={{ width: `${spentPercentage}%` }}
                            />
                        </div>
                        <div className="mt-1 flex justify-between text-xs text-slate-400">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </div>

                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-blue-100 border-l-4 border-l-blue-700">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900">
                        <MapPin className="h-5 w-5 text-yellow-500" /> Destinacije
                    </h2>
                    <AddDestinationForm travelPlanId={plan.id} onAdded={() => {
                        const load = async () => {
                            const data = await travelPlanApi.getOverview(Number(id));
                            setOverview(data);
                        };
                        load();
                    }} />
                    {destinations.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-400">Nema dodanih destinacija.</p>
                    ) : (
                        <div className="mt-4 space-y-4">
                            {destinations.map((d) => (
                                <div key={d.destination.id} className="rounded-lg border border-slate-200 p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-semibold text-slate-800">{d.destination.name}
                                                <span className="ml-1 text-sm font-normal text-slate-500">({d.destination.location})</span>
                                            </p>
                                            <p className="text-xs text-slate-400">
                                                {new Date(d.destination.arrivalDate).toLocaleDateString('sr-Latn')} — {new Date(d.destination.departureDate).toLocaleDateString('sr-Latn')}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingDestinationId(d.destination.id)}
                                                className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                                <Pencil className="h-3 w-3" /> Izmeni
                                            </button>
                                            <button onClick={() => handleDeleteDestination(d.destination.id)}
                                                className="flex items-center gap-1 text-xs text-red-600 hover:underline">
                                                <Trash2 className="h-3 w-3" /> Obrisi
                                            </button>
                                        </div>
                                    </div>
                                    {editingDestinationId === d.destination.id && (
                                        <EditDestinationForm
                                            destination={d.destination}
                                            onSaved={() => {
                                                setEditingDestinationId(null);
                                                const load = async () => {
                                                    const data = await travelPlanApi.getOverview(Number(id));
                                                    setOverview(data);
                                                };
                                                load();
                                            }}
                                            onCancel={() => setEditingDestinationId(null)}
                                        />
                                    )}
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
                                                        <div className="flex gap-2">
                                                            <button onClick={() => setEditingActivityId(a.id)}
                                                                className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                                                <Pencil className="h-3 w-3" /> Izmeni
                                                            </button>
                                                            <button onClick={() => handleDeleteActivity(a.id)}
                                                                className="flex items-center gap-1 text-xs text-red-600 hover:underline">
                                                                <Trash2 className="h-3 w-3" /> Obrisi
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-xs text-slate-400">
                                                        {new Date(a.date).toLocaleDateString('sr-Latn')} • {a.location}
                                                    </p>
                                                    {editingActivityId === a.id && (
                                                        <EditActivityForm
                                                            activity={a}
                                                            onSaved={() => {
                                                                setEditingActivityId(null);
                                                                const load = async () => {
                                                                    const data = await travelPlanApi.getOverview(Number(id));
                                                                    setOverview(data);
                                                                };
                                                                load();
                                                            }}
                                                            onCancel={() => setEditingActivityId(null)}
                                                        />
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <AddActivityForm destinationId={d.destination.id} onAdded={() => {
                                        const load = async () => {
                                            const data = await travelPlanApi.getOverview(Number(id));
                                            setOverview(data);
                                        };
                                        load();
                                    }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-blue-100 border-l-4 border-l-blue-700">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900">
                        <DollarSign className="h-5 w-5 text-yellow-500" /> Troskovi
                    </h2>
                    <AddExpenseForm travelPlanId={plan.id} remainingBudget={budget.remainingBudget} onAdded={() => {
                        const load = async () => {
                            const data = await travelPlanApi.getOverview(Number(id));
                            setOverview(data);
                        };
                        load();
                    }} />
                    {expenses.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-400">Nema evidentiranih troskova.</p>
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
                                            <button onClick={() => setEditingExpenseId(e.id)}
                                                className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                                                <Pencil className="h-3 w-3" /> Izmeni
                                            </button>
                                            <button onClick={() => handleDeleteExpense(e.id)}
                                                className="flex items-center gap-1 text-xs text-red-600 hover:underline">
                                                <Trash2 className="h-3 w-3" /> Obrisi
                                            </button>
                                        </div>
                                    </div>
                                    {editingExpenseId === e.id && (
                                        <EditExpenseForm
                                            expense={e}
                                            onSaved={() => {
                                                setEditingExpenseId(null);
                                                const load = async () => {
                                                    const data = await travelPlanApi.getOverview(Number(id));
                                                    setOverview(data);
                                                };
                                                load();
                                            }}
                                            onCancel={() => setEditingExpenseId(null)}
                                        />
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-blue-100 border-l-4 border-l-blue-700">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900">
                        <CheckSquare className="h-5 w-5 text-yellow-500" /> Checklist
                    </h2>
                    <AddChecklistItemForm travelPlanId={plan.id} onAdded={() => {
                        const load = async () => {
                            const data = await travelPlanApi.getOverview(Number(id));
                            setOverview(data);
                        };
                        load();
                    }} />
                    {checklistItems.length === 0 ? (
                        <p className="mt-3 text-sm text-slate-400">Nema stavki na checklisti.</p>
                    ) : (
                        <ul className="mt-3 space-y-2">
                            {checklistItems.map((c) => (
                                <li key={c.id} className="flex items-center justify-between rounded-md bg-slate-50 p-2">
                                    <label className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={c.isCompleted}
                                            onChange={() => handleToggleChecklistItem(c.id, c.title, c.isCompleted)}
                                            className="h-4 w-4 accent-blue-700"
                                        />
                                        <span className={c.isCompleted ? 'line-through text-slate-400' : 'text-slate-700'}>
                                            {c.title}
                                        </span>
                                    </label>
                                    <button onClick={() => handleDeleteChecklistItem(c.id)}
                                        className="flex items-center gap-1 text-xs text-red-600 hover:underline">
                                        <Trash2 className="h-3 w-3" /> Obrisi
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {isOwner && (
                    <div className="rounded-xl bg-white p-6 shadow-sm border border-blue-100 border-l-4 border-l-blue-700">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900">
                            <Share2 className="h-5 w-5 text-yellow-500" /> Deljenje plana
                        </h2>
                        <SharePanel travelPlanId={plan.id} />
                    </div>
                )}
            </div>
        </div>
    );
}