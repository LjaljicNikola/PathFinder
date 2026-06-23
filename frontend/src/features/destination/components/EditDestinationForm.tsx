import { useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import tripApi from '../../../api/tripApi';

interface Props {
    destination: {
        id: number;
        name: string;
        location: string;
        arrivalDate: string;
        departureDate: string;
        notes: string;
    };
    onSaved: () => void;
    onCancel: () => void;
}

export default function EditDestinationForm({ destination, onSaved, onCancel }: Props) {
    const [name, setName] = useState(destination.name);
    const [location, setLocation] = useState(destination.location);
    const [arrivalDate, setArrivalDate] = useState(destination.arrivalDate.split('T')[0]);
    const [departureDate, setDepartureDate] = useState(destination.departureDate.split('T')[0]);
    const [notes, setNotes] = useState(destination.notes);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await tripApi.put(`/destinations/${destination.id}`, {
                name, location, arrivalDate, departureDate, notes,
            });
            toast.success('Destinacija je izmijenjena.');
            onSaved();
        } catch {
            toast.error('Greška prilikom izmjene destinacije.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2 rounded-md border border-indigo-200 bg-indigo-50 p-4">
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Naziv"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input value={location} onChange={(e) => setLocation(e.target.value)} required placeholder="Lokacija"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-2">
                <input type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Napomena"
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