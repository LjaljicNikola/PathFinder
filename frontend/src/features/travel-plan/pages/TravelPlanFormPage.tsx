import { useEffect, useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import { MapPin, Calendar, DollarSign, FileText, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { travelPlanApi } from '../api/travelPlanApi';
import { useAuth } from '../../../context/useAuth';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

export default function TravelPlanFormPage() {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const location = useLocation();
    const returnTo = (location.state as { returnTo?: string })?.returnTo ?? '/';
    const { currentUser } = useAuth();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [plannedBudget, setPlannedBudget] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Validation errors
    const [errors, setErrors] = useState({
        startDate: '',
        endDate: '',
        budget: '',
    });

    // Load plan data
    useEffect(() => {
        const loadPlan = async () => {
            if (!isEditMode) return;

            setIsLoading(true);
            try {
                const plan = await travelPlanApi.getById(Number(id));
                setTitle(plan.title);
                setDescription(plan.description);
                setStartDate(plan.startDate.split('T')[0]);
                setEndDate(plan.endDate.split('T')[0]);
                setPlannedBudget(plan.plannedBudget.toString());
                setNotes(plan.notes);
            } catch {
                toast.error('Greska prilikom ucitavanja plana.');
            } finally {
                setIsLoading(false);
            }
        };

        loadPlan();
    }, [id, isEditMode]);

    // Real-time validation
    const validateDates = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const start = new Date(startDate);
        const end = new Date(endDate);

        const newErrors = { startDate: '', endDate: '', budget: '' };
        let isValid = true;

        // Start date cannot be in the past
        if (startDate && start < today) {
            newErrors.startDate = 'Pocetni datum ne moze biti u proslosti';
            isValid = false;
        }

        // End date must be >= start date
        if (startDate && endDate && end < start) {
            newErrors.endDate = 'Krajnji datum mora biti nakon pocetnog datuma';
            isValid = false;
        }

        // End date cannot be in the past if start date is not set
        if (endDate && end < today && !startDate) {
            newErrors.endDate = 'Krajnji datum ne moze biti u proslosti';
            isValid = false;
        }

        // Budget validation
        if (plannedBudget && Number(plannedBudget) < 0) {
            newErrors.budget = 'Budzet ne moze biti negativan';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Handle date changes
    const handleDateChange = (type: 'start' | 'end', value: string) => {
        if (type === 'start') {
            setStartDate(value);
            // If end date is before new start date, clear it
            if (endDate && new Date(endDate) < new Date(value)) {
                setEndDate('');
            }
        } else {
            setEndDate(value);
        }
        validateDates();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Check validation before submit
        if (!validateDates()) {
            toast.error('Molimo ispravite greske u formi.');
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
                toast.success('Plan je izmenjen.');
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
            navigate(returnTo);
        } catch {
            toast.error('Greska prilikom cuvanja plana.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Check if form is valid (for disabling submit button)
    const isFormValid = () => {
        return (
            title.trim() !== '' &&
            startDate !== '' &&
            endDate !== '' &&
            plannedBudget !== '' &&
            Number(plannedBudget) >= 0 &&
            !errors.startDate &&
            !errors.endDate &&
            !errors.budget
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-700 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-slate-500">Ucitavanje plana...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-4xl px-8 py-10">
                {/* Back button */}
                <button
                    onClick={() => navigate(returnTo)}
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
                                ? 'Azurirajte detalje vaseg plana putovanja'
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
                                placeholder="Unesite naziv vaseg putovanja"
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
                                placeholder="Opisite vase putovanje..."
                                rows={3}
                                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>

                        {/* Dates */}
                        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <Calendar className="h-4 w-4 text-yellow-500" />
                                    Pocetni datum <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => handleDateChange('start', e.target.value)}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${errors.startDate
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
                                        }`}
                                />
                                {errors.startDate && (
                                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.startDate}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                                    <Calendar className="h-4 w-4 text-yellow-500" />
                                    Krajnji datum <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => handleDateChange('end', e.target.value)}
                                    required
                                    min={startDate || new Date().toISOString().split('T')[0]}
                                    className={`w-full rounded-lg border px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 ${errors.endDate
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
                                        }`}
                                />
                                {errors.endDate && (
                                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                        <AlertCircle className="h-3 w-3" />
                                        {errors.endDate}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Budget */}
                        <div className="mb-5">
                            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <DollarSign className="h-4 w-4 text-yellow-500" />
                                Planirani budzet <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={plannedBudget}
                                    onChange={(e) => {
                                        setPlannedBudget(e.target.value);
                                        validateDates();
                                    }}
                                    placeholder="0.00"
                                    required
                                    className={`w-full rounded-lg border px-4 py-2.5 pl-10 text-sm transition-all focus:outline-none focus:ring-2 ${errors.budget
                                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                            : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
                                        }`}
                                />
                            </div>
                            {errors.budget && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                                    <AlertCircle className="h-3 w-3" />
                                    {errors.budget}
                                </p>
                            )}
                            {!errors.budget && plannedBudget && Number(plannedBudget) >= 0 && (
                                <p className="mt-1 text-xs text-green-600">
                                    Budzet je validan
                                </p>
                            )}
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
                            disabled={isSubmitting || !isFormValid()}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 py-3 font-medium text-white transition-all hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                    Cuvanje...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    {isEditMode ? 'Sacuvaj izmene' : 'Kreiraj plan'}
                                </>
                            )}
                        </button>

                        {/* Info note */}
                        <p className="mt-3 flex items-center justify-center gap-1 text-xs text-slate-400">
                            <AlertCircle className="h-3 w-3" />
                            Polja oznacena sa <span className="text-red-500">*</span> su obavezna
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}