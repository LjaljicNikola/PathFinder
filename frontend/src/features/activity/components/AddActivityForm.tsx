import { useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import { activityApi } from '../api/activityApi';

interface Props {
    destinationId: number;
    onAdded: () => void;
}

const STATUS_OPTIONS = [
    { value: 'Planned', label: 'Planirano' },
    { value: 'Booked', label: 'Rezervisano' },
    { value: 'Completed', label: 'Završeno' },
    { value: 'Cancelled', label: 'Otkazano' },
];

export default function AddActivityForm({ destinationId, onAdded }: Props) {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [estimatedCost, setEstimatedCost] = useState('');
    const [status, setStatus] = useState('Planned');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await activityApi.create({
                destinationId,
                name,
                date,
                time: time + ':00',
                location,
                description,
                estimatedCost: Number(estimatedCost),
                status,
            });
            toast.success('Aktivnost je dodana.');
            setName('');
            setDate('');
            setTime('');
            setLocation('');
            setDescription('');
            setEstimatedCost('');
            setStatus('Planned');
            setIsOpen(false);
            onAdded();
        } catch {
            toast.error('Greška prilikom dodavanja aktivnosti.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="mt-1 text-xs text-indigo-600 hover:underline"
            >
                + Dodaj aktivnost
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="mt-2 space-y-2 rounded-md bg-slate-50 p-3">
            <input
                placeholder="Naziv aktivnosti"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
            />
            <div className="grid grid-cols-2 gap-2">
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                />
                <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
                />
            </div>
            <input
                placeholder="Lokacija"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
            />
            <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Procijenjeni trošak"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
            />
            <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
            >
                {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                ))}
            </select>
            <textarea
                placeholder="Opis"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs"
            />
            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-md bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    Sačuvaj
                </button>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-md bg-slate-200 px-2 py-1 text-xs text-slate-700"
                >
                    Otkaži
                </button>
            </div>
        </form>
    );
}