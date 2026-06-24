import { useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import tripApi from '../../../api/tripApi';

interface Props {
    activity: {
        id: number;
        name: string;
        date: string;
        time: string;
        location: string;
        description: string;
        estimatedCost: number;
        status: string;
    };
    onSaved: () => void;
    onCancel: () => void;
}

const STATUS_OPTIONS = [
    { value: 'Planned', label: 'Planirano' },
    { value: 'Booked', label: 'Rezervisano' },
    { value: 'Completed', label: 'Završeno' },
    { value: 'Cancelled', label: 'Otkazano' },
];

export default function EditActivityForm({ activity, onSaved, onCancel }: Props) {
    const [name, setName] = useState(activity.name);
    const [date, setDate] = useState(activity.date.split('T')[0]);
    const [time, setTime] = useState(activity.time.substring(0, 5));
    const [location, setLocation] = useState(activity.location);
    const [description, setDescription] = useState(activity.description);
    const [estimatedCost, setEstimatedCost] = useState(activity.estimatedCost.toString());
    const [status, setStatus] = useState(activity.status);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await tripApi.put(`/activities/${activity.id}`, {
                name, date, time: time + ':00', location, description,
                estimatedCost: Number(estimatedCost), status,
            });
            toast.success('Aktivnost je izmijenjena.');
            onSaved();
        } catch {
            toast.error('Greška prilikom izmjene aktivnosti.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-2 space-y-2 rounded-md bg-indigo-50 p-3">
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Naziv"
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs" />
            <div className="grid grid-cols-2 gap-2">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs" />
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required
                    className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs" />
            </div>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lokacija"
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs" />
            <input type="number" min="0" step="0.01" value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)} required
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs" />
            <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs">
                {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                ))}
            </select>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opis"
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-xs" />
            <div className="flex gap-2">
                <button type="submit" disabled={isSubmitting}
                    className="rounded-md bg-indigo-600 px-2 py-1 text-xs text-white hover:bg-indigo-700 disabled:opacity-50">
                    Sačuvaj
                </button>
                <button type="button" onClick={onCancel}
                    className="rounded-md bg-slate-200 px-2 py-1 text-xs text-slate-700">
                    Otkaži
                </button>
            </div>
        </form>
    );
}