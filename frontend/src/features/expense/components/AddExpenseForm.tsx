import { useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import { expenseApi } from '../api/expenseApi';

interface Props {
    travelPlanId: number;
    remainingBudget: number;
    onAdded: () => void;
}

const CATEGORIES = ['Prevoz', 'Smještaj', 'Hrana', 'Ulaznice', 'Kupovina', 'Ostalo'];

export default function AddExpenseForm({ travelPlanId, remainingBudget, onAdded }: Props) {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('Prevoz');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (Number(amount) < 0) {
            toast.error('Iznos ne može biti negativan.');
            return;
        }

        if (Number(amount) > remainingBudget) {
            toast.error(`Iznos prelazi preostali budžet (${remainingBudget.toFixed(2)}).`);
            return;
        }

        setIsSubmitting(true);
        try {
            await expenseApi.create({
                travelPlanId,
                name,
                category,
                amount: Number(amount),
                date,
                description,
            });
            toast.success('Trošak je dodan.');
            setName('');
            setAmount('');
            setDate('');
            setDescription('');
            setIsOpen(false);
            onAdded();
        } catch {
            toast.error('Greška prilikom dodavanja troška.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="text-sm text-indigo-600 hover:underline">
                + Dodaj trošak
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2 rounded-md border border-slate-200 p-4">
            <input
                placeholder="Naziv"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
                {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
                <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Iznos"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
            </div>
            <textarea
                placeholder="Opis"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    Sačuvaj
                </button>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
                >
                    Otkaži
                </button>
            </div>
        </form>
    );
}