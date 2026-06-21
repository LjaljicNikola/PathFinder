import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
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
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-lg rounded-xl bg-white p-8 shadow-sm">
                <h1 className="mb-6 text-2xl font-semibold text-slate-800">
                    {isEditMode ? 'Izmjena plana putovanja' : 'Novi plan putovanja'}
                </h1>

                <form onSubmit={handleSubmit}>
                    <label className="mb-1 block text-sm font-medium text-slate-600">Naziv</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2"
                    />

                    <label className="mb-1 block text-sm font-medium text-slate-600">Opis</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2"
                    />

                    <div className="mb-4 grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-600">Početni datum</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                required
                                className="w-full rounded-md border border-slate-300 px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-600">Krajnji datum</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                required
                                className="w-full rounded-md border border-slate-300 px-3 py-2"
                            />
                        </div>
                    </div>

                    <label className="mb-1 block text-sm font-medium text-slate-600">Planirani budžet</label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={plannedBudget}
                        onChange={(e) => setPlannedBudget(e.target.value)}
                        required
                        className="mb-4 w-full rounded-md border border-slate-300 px-3 py-2"
                    />

                    <label className="mb-1 block text-sm font-medium text-slate-600">Napomene</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mb-6 w-full rounded-md border border-slate-300 px-3 py-2"
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full rounded-md bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Čuvanje...' : isEditMode ? 'Sačuvaj izmjene' : 'Kreiraj plan'}
                    </button>
                </form>
            </div>
        </div>
    );
}