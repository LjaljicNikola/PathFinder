import { useState, type FormEvent } from 'react';
import { toast } from 'react-toastify';
import { destinationApi } from '../api/destinationApi';

interface Props {
    travelPlanId: number;
    onAdded: () => void;
}

export default function AddDestinationForm({ travelPlanId, onAdded }: Props) {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [arrivalDate, setArrivalDate] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await destinationApi.create({
                travelPlanId,
                name,
                location,
                arrivalDate,
                departureDate,
                notes,
            });
            toast.success('Destinacija je dodana.');
            setName('');
            setLocation('');
            setArrivalDate('');
            setDepartureDate('');
            setNotes('');
            setIsOpen(false);
            onAdded();
        } catch {
            toast.error('Greška prilikom dodavanja destinacije.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-sm text-indigo-600 hover:underline"
            >
                + Dodaj destinaciju
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
            <input
                placeholder="Lokacija"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
                <input
                    type="date"
                    value={arrivalDate}
                    onChange={(e) => setArrivalDate(e.target.value)}
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    required
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
            </div>
            <textarea
                placeholder="Napomena"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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