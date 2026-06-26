import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MapPin, Calendar, DollarSign, FileText, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { travelPlanApi } from '../api/travelPlanApi';
import { useAuth } from '../../../context/useAuth';

export default function TravelPlanFormPage() {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [plannedBudget, setPlannedBudget] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadPlan = async () => {
        try {
            const plan = await travelPlanApi.getById(Number(id));
            setTitle(plan.title);
            setDescription(plan.description);
            setStartDate(plan.startDate.split('T')[0]);
            setEndDate(plan.endDate.split('T')[0]);
            setPlannedBudget(plan.plannedBudget.toString());
            setNotes(plan.notes);
        } catch {
            toast.error('Greška prilikom učitavanja plana.');
        }
    };

    useEffect(() => {
        if (isEditMode) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadPlan();
        }
    }, [id]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (new Date(endDate) < new Date(startDate)) {
            toast.error('Krajnji datum ne može biti prije početnog datuma.');
            return;
        }
        if (Number(plannedBudget) < 0) {
            toast.error('Budžet ne može biti negativan.');
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditMode) {
                await travelPlanApi.update(Number(id), {
                    title,
                    description,
                    startDate,
                    endDate,
                    plannedBudget: Number(plannedBudget),
                    notes,
                });
                toast.success('Plan je izmijenjen.');
            } else {
                await travelPlanApi.create({
                    userId: currentUser!.id,
                    title,
                    description,
                    startDate,
                    endDate,
                    plannedBudget: Number(plannedBudget),
                    notes,
                });
                toast.success('Plan je kreiran.');
            }
            navigate('/');
        } catch {
            toast.error('Greška prilikom čuvanja plana.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-4xl px-8 py-10">
                {/* Back button */}
                <button
                    onClick={() => navigate('/')}
                    className="mb-6 inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" /> Nazad na listu
                </button>

                {/* Main card */}
                <div className="rounded-xl border-l-4 border-blue-700 bg-white p-8 shadow-sm">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-blue-900">
                            {isEditMode ? 'Izmjena plana putovanja' : 'Novi plan putovanja'}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {isEditMode
                                ? 'Ažurirajte detalje vašeg plana putovanja'
                                : 'Kreirajte novi plan putovanja i organizujte svoje avanture'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Title */}
                        <div className="mb-5">
                            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <MapPin className="h-4 w-4 text-yellow-500" />
                                Naziv plana <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Unesite naziv vašeg putovanja"
                                required
                                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        {/* Description */}
                        <div className="mb-5">
                            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <FileText className="h-4 w-4 text-yellow-500" />
                                Opis
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Opišite vaše putovanje..."
                                rows={3}
                                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        {/* Dates */}
                        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <Calendar className="h-4 w-4 text-yellow-500" />
                                    Početni datum <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <Calendar className="h-4 w-4 text-yellow-500" />
                                    Krajnji datum <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="mb-5">
                            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <DollarSign className="h-4 w-4 text-yellow-500" />
                                Planirani budžet <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={plannedBudget}
                                    onChange={(e) => setPlannedBudget(e.target.value)}
                                    placeholder="0.00"
                                    required
                                    className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <p className="mt-1 text-xs text-slate-400">Unesite ukupan planirani budžet za putovanje</p>
                        </div>

                        {/* Notes */}
                        <div className="mb-6">
                            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <FileText className="h-4 w-4 text-yellow-500" />
                                Napomene
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Dodatne napomene o putovanju..."
                                rows={2}
                                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 py-3 font-medium text-white transition-all hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Čuvanje...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    {isEditMode ? 'Sačuvaj izmjene' : 'Kreiraj plan'}
                                </>
                            )}
                        </button>

                        {/* Info note */}
                        <p className="mt-3 flex items-center justify-center gap-1 text-xs text-slate-400">
                            <AlertCircle className="h-3 w-3" />
                            Polja označena sa <span className="text-red-500">*</span> su obavezna
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}