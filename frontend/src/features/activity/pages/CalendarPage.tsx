import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { ArrowLeft, CalendarDays, Clock, CheckCircle, XCircle, Bookmark, AlertCircle, MapPin, DollarSign, FileText, X } from 'lucide-react';
import tripApi from '../../../api/tripApi';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { DestinationWithActivities, ActivityItem } from '../../travel-plan/types/TravelPlanOverview';
import { useParams, Link } from 'react-router-dom';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
});

interface CalendarEvent {
    id: number;
    title: string;
    start: Date;
    end: Date;
    status: string;
    resource: ActivityItem & { destinationName: string };
}

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
    Planned: { color: '#6366f1', bgColor: 'bg-indigo-500', label: 'Planirano', icon: <Bookmark className="h-3 w-3" /> },
    Booked: { color: '#0ea5e9', bgColor: 'bg-sky-500', label: 'Rezervisano', icon: <CheckCircle className="h-3 w-3" /> },
    Completed: { color: '#22c55e', bgColor: 'bg-green-500', label: 'Završeno', icon: <CheckCircle className="h-3 w-3" /> },
    Cancelled: { color: '#ef4444', bgColor: 'bg-red-500', label: 'Otkazano', icon: <XCircle className="h-3 w-3" /> },
};

export default function CalendarPage() {
    const { id } = useParams();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'agenda'>('week');
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [groupedActivities, setGroupedActivities] = useState<Record<string, (ActivityItem & { destinationName: string })[]>>({});

    

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const response = await tripApi.get(`/travel-plans/${id}/overview`);
                const overview = response.data;
                const calendarEvents: CalendarEvent[] = [];
                const grouped: Record<string, (ActivityItem & { destinationName: string })[]> = {};

                overview.destinations.forEach((d: DestinationWithActivities) => {
                    d.activities.forEach((a: ActivityItem) => {
                        const [hours, minutes] = a.time.split(':');
                        const start = new Date(a.date);
                        start.setHours(Number(hours), Number(minutes));
                        const end = new Date(start);
                        end.setHours(end.getHours() + 1);

                        calendarEvents.push({
                            id: a.id,
                            title: `${a.time.slice(0, 5)} ${a.name}`,
                            start,
                            end,
                            status: a.status,
                            resource: { ...a, destinationName: d.destination.name },
                        });

                        const dateKey = a.date.split('T')[0];
                        if (!grouped[dateKey]) grouped[dateKey] = [];
                        grouped[dateKey].push({ ...a, destinationName: d.destination.name });
                    });
                });

                const sortedGrouped: Record<string, (ActivityItem & { destinationName: string })[]> = {};
                Object.keys(grouped).sort().forEach(key => {
                    sortedGrouped[key] = grouped[key].sort((a, b) => a.time.localeCompare(b.time));
                });

                if (!cancelled) {
                    setEvents(calendarEvents);
                    setGroupedActivities(sortedGrouped);
                }
            } catch {
                if (!cancelled) toast.error('Greška prilikom učitavanja aktivnosti.');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        load();
        return () => { cancelled = true; };
    }, [id]);

    const eventStyleGetter = (event: CalendarEvent) => {
        const colors: Record<string, string> = {
            Planned: '#6366f1', Booked: '#0ea5e9', Completed: '#22c55e', Cancelled: '#ef4444',
        };
        return {
            style: {
                backgroundColor: colors[event.status] || '#6366f1',
                borderRadius: '4px',
                border: 'none',
                color: 'white',
                fontSize: '12px',
                padding: '2px 6px',
            },
        };
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-700 border-t-transparent"></div>
                    <p className="text-sm text-slate-500">Učitavanje aktivnosti...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="mx-auto max-w-6xl px-8 py-10">
                <Link to={`/planovi/${id}`} className="mb-6 inline-flex items-center gap-1 text-sm text-blue-700 hover:underline">
                    <ArrowLeft className="h-4 w-4" /> Nazad na plan
                </Link>

                {/* Header */}
                <div className="mb-6 rounded-xl border-l-4 border-blue-700 bg-white p-6 shadow-sm">
                    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="flex items-center gap-2 text-2xl font-bold text-blue-900">
                                <CalendarDays className="h-7 w-7 text-yellow-500" />
                                Kalendar aktivnosti
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">Pregled svih aktivnosti po danima i vremenu</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="h-3 w-3" />
                            {events.length} aktivnosti
                        </div>
                    </div>
                </div>

                {/* Calendar */}
                <div className="rounded-xl border-l-4 border-blue-700 bg-white p-6 shadow-sm">
                    <div style={{ height: '600px' }}>
                        <Calendar
                            localizer={localizer}
                            events={events}
                            startAccessor="start"
                            endAccessor="end"
                            eventPropGetter={eventStyleGetter}
                            culture="en-US"
                            date={currentDate}
                            view={currentView}
                            onNavigate={(date) => setCurrentDate(date)}
                            onView={(view) => setCurrentView(view as 'month' | 'week' | 'day' | 'agenda')}
                            defaultView="week"
                            onSelectEvent={(event) => setSelectedEvent(event as CalendarEvent)}
                            messages={{
                                next: 'Sledeće', previous: 'Prethodno', today: 'Danas',
                                month: 'Mesec', week: 'Sedmica', day: 'Dan', agenda: 'Raspored',
                            }}
                        />
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="text-sm font-medium text-slate-700">Status:</span>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <div key={key} className="flex items-center gap-1.5">
                                <span className={`h-3 w-3 rounded-full ${config.bgColor}`}></span>
                                <span className="flex items-center gap-1 text-xs text-slate-600">
                                    {config.icon}{config.label}
                                </span>
                            </div>
                        ))}
                        <div className="ml-auto flex items-center gap-1 text-xs text-slate-400">
                            <AlertCircle className="h-3 w-3" />
                            Kliknite na aktivnost za detalje
                        </div>
                    </div>
                </div>

                {/* Grouped by day */}
                {Object.keys(groupedActivities).length > 0 && (
                    <div className="mt-6">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-blue-900">
                            <CalendarDays className="h-5 w-5 text-yellow-500" />
                            Aktivnosti po danima
                        </h2>
                        <div className="space-y-4">
                            {Object.entries(groupedActivities).map(([dateKey, activities]) => (
                                <div key={dateKey} className="rounded-xl border-l-4 border-blue-700 bg-white shadow-sm overflow-hidden">
                                    <div className="bg-blue-50 px-5 py-3 border-b border-slate-100">
                                        <span className="font-semibold text-blue-900 text-sm">
                                            {new Date(dateKey).toLocaleDateString('sr-Latn', {
                                                weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
                                            })}
                                        </span>
                                        <span className="ml-2 text-xs text-slate-500">{activities.length} aktivnosti</span>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {activities.map((a) => {
                                            const status = STATUS_CONFIG[a.status] || STATUS_CONFIG['Planned'];
                                            return (
                                                <div key={a.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                                                    <div className="flex flex-col items-center min-w-[48px]">
                                                        <span className="text-sm font-bold text-blue-900">{a.time.slice(0, 5)}</span>
                                                        <span className={`mt-1 h-2 w-2 rounded-full ${status.bgColor}`}></span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-semibold text-slate-800">{a.name}</span>
                                                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white ${status.bgColor}`}>
                                                                {status.icon}{status.label}
                                                            </span>
                                                        </div>
                                                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />{a.destinationName}
                                                            </span>
                                                            {a.location && (
                                                                <span className="flex items-center gap-1">
                                                                    <MapPin className="h-3 w-3 text-yellow-500" />{a.location}
                                                                </span>
                                                            )}
                                                            {a.estimatedCost > 0 && (
                                                                <span className="flex items-center gap-1">
                                                                    <DollarSign className="h-3 w-3" />{a.estimatedCost} €
                                                                </span>
                                                            )}
                                                        </div>
                                                        {a.description && (
                                                            <p className="mt-1 text-xs text-slate-400">{a.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {events.length === 0 && (
                    <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                        <CalendarDays className="mx-auto h-12 w-12 text-slate-300" />
                        <p className="mt-2 text-sm text-slate-500">Nema aktivnosti za prikaz u kalendaru</p>
                        <p className="text-xs text-slate-400">Dodajte aktivnosti u vaš plan putovanja</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setSelectedEvent(null)}>
                    <div className="w-full max-w-md rounded-xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                            <h3 className="font-bold text-blue-900 text-lg">{selectedEvent.resource.name}</h3>
                            <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="px-6 py-5 space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-yellow-500" />
                                <span className="text-slate-600">{new Date(selectedEvent.resource.date).toLocaleDateString('sr-Latn', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })} u {selectedEvent.resource.time.slice(0, 5)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-yellow-500" />
                                <span className="text-slate-600">{selectedEvent.resource.destinationName}{selectedEvent.resource.location ? ` — ${selectedEvent.resource.location}` : ''}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                {STATUS_CONFIG[selectedEvent.resource.status]?.icon}
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-white ${STATUS_CONFIG[selectedEvent.resource.status]?.bgColor}`}>
                                    {STATUS_CONFIG[selectedEvent.resource.status]?.label}
                                </span>
                            </div>
                            {selectedEvent.resource.estimatedCost > 0 && (
                                <div className="flex items-center gap-2 text-sm">
                                    <DollarSign className="h-4 w-4 text-yellow-500" />
                                    <span className="text-slate-600">Procijenjeni trošak: <strong>{selectedEvent.resource.estimatedCost} €</strong></span>
                                </div>
                            )}
                            {selectedEvent.resource.description && (
                                <div className="flex items-start gap-2 text-sm">
                                    <FileText className="h-4 w-4 text-yellow-500 mt-0.5" />
                                    <span className="text-slate-600">{selectedEvent.resource.description}</span>
                                </div>
                            )}
                        </div>
                        <div className="border-t border-slate-100 px-6 py-3 flex justify-end">
                            <button onClick={() => setSelectedEvent(null)} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800">
                                Zatvori
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}