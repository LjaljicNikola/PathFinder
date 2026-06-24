import { useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import tripApi from '../../../api/tripApi';

interface Props {
    expense: {
        id: number;
        name: string;
        category: string;
        amount: number;
        date: string;
        description: string;
    };
    onSaved: () => void;
    onCancel: () => void;
}

const CATEGORIES = ['Prevoz', 'Smještaj', 'Hrana', 'Ulaznice', 'Kupovina', 'Ostalo'];

export default function EditExpenseForm({ expense, onSaved, onCancel }: Props) {
    const [name, setName] = useState(expense.name);
    const [category, setCategory] = useState(expense.category);
    const [amount, setAmount] = useState(expense.amount.toString());
    const [date, setDate] = useState(expense.date.split('T')[0]);
    const [description, setDescription] = useState(expense.description);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (Number(amount) < 0) {
            toast.error('Iznos ne može biti negativan.');
            return;
        }
        setIsSubmitting(true);
        try {
            await tripApi.put(`/expenses/${expense.id}`, {
                name, category, amount: Number(amount), date, description,
            });
            toast.success('Trošak je izmijenjen.');
            onSaved();
        } catch {
            toast.error('Greška prilikom izmjene troška.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-2 space-y-2 rounded-md border border-indigo-200 bg-indigo-50 p-3">
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Naziv"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
                <input type="number" min="0" step="0.01" value={amount}
                    onChange={(e) => setAmount(e.target.value)} required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opis"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <div className="flex gap-2">
                <button type="submit" disabled={isSubmitting}
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 disabled:opacity-50">
                    Sačuvaj
                </button>
                <button type="button" onClick={onCancel}
                    className="rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200">
                    Otkaži
                </button>
            </div>
        </form>
    );
}