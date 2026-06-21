import { useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import { checklistApi } from '../api/checklistApi';

interface Props {
    travelPlanId: number;
    onAdded: () => void;
}

export default function AddChecklistItemForm({ travelPlanId, onAdded }: Props) {
    const [title, setTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsSubmitting(true);
        try {
            await checklistApi.create({ travelPlanId, title });
            setTitle('');
            onAdded();
        } catch {
            toast.error('Greška prilikom dodavanja stavke.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-3 flex gap-2">
            <input
                placeholder="Nova stavka (npr. pasoš, karta...)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            />
            <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
            >
                Dodaj
            </button>
        </form>
    );
}