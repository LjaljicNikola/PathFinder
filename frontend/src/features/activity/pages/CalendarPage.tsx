import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { ArrowLeft, CalendarDays, Clock, CheckCircle, XCircle, Bookmark, AlertCircle } from 'lucide-react';
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
}

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
    Planned: {
        color: '#6366f1',
        bgColor: 'bg-indigo-500',
        label: 'Planirano',
        icon: <Bookmark className="h-3 w-3" />
    },
    Booked: {
        color: '#0ea5e9',
        bgColor: 'bg-sky-500',
        label: 'Rezervisano',
        icon: <CheckCircle className="h-3 w-3" />
    },
    Completed: {
        color: '#22c55e',
        bgColor: 'bg-green-500',
        label: 'Završeno',
        icon: <CheckCircle className="h-3 w-3" />
    },
    Cancelled: {
        color: '#ef4444',
        bgColor: 'bg-red-500',
        label: 'Otkazano',
        icon: <XCircle className="h-3 w-3" />
    },
};

export default function CalendarPage() {
    const { id } = useParams();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentView, setCurrentView] = useState<'month' | 'week' | 'day' | 'agenda'>('week');

    useEffect(() => {
        // eslint-disable-next-line
        loadActivities();
    }, [id]);

    const loadActivities = async () => {
        try {
            const response = await tripApi.get(`/travel-plans/${id}/overview`);
            const overview = response.data;

            const calendarEvents: CalendarEvent[] = [];
            overview.destinations.forEach((d: DestinationWithActivities) => {
                d.activities.forEach((a: ActivityItem) => {
                    const [hours, minutes] = a.time.split(':');
                    const start = new Date(a.date);
                    start.setHours(Number(hours), Number(minutes));
                    const end = new Date(start);
                    end.setHours(end.getHours() + 1);

                    calendarEvents.push({
                        id: a.id,
                        title: `${a.name} (${d.destination.name})`,
                        start,
                        end,
                        status: a.status,
                    });
                });
            });

            setEvents(calendarEvents);
        } catch {
            toast.error('Greška prilikom učitavanja aktivnosti.');
        } finally {
            setIsLoading(false);
        }
    };

    const eventStyleGetter = (event: CalendarEvent) => {
        const colors: Record<string, string> = {
            Planned: '#6366f1',
            Booked: '#0ea5e9',
            Completed: '#22c55e',
            Cancelled: '#ef4444',
        };
        return {
            style: {
                backgroundColor: colors[event.status] || '#6366f1',
                borderRadius: '4px',
                border: 'none',
                color: 'white',
                fontSize: '12px',
                padding: '2px 4px',
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
                {/* Back button */}
                <Link
                    to={`/planovi/${id}`}
                    className="mb-6 inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
                >
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
                            <p className="mt-1 text-sm text-slate-500">
                                Pregled svih aktivnosti po danima i vremenu
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-500">
                                {events.length} aktivnosti
                            </span>
                            <span className="h-6 w-px bg-slate-200"></span>
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                <Clock className="h-3 w-3" />
                                {new Date().toLocaleDateString('sr-Latn')}
                            </div>
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
                            messages={{
                                next: 'Sljedeće',
                                previous: 'Prethodno',
                                today: 'Danas',
                                month: 'Mjesec',
                                week: 'Sedmica',
                                day: 'Dan',
                                agenda: 'Raspored',
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
                                    {config.icon}
                                    {config.label}
                                </span>
                            </div>
                        ))}
                        <div className="ml-auto flex items-center gap-1 text-xs text-slate-400">
                            <AlertCircle className="h-3 w-3" />
                            {events.length === 0 ? 'Nema aktivnosti za prikaz' : `${events.length} aktivnosti prikazano`}
                        </div>
                    </div>
                </div>

                {/* Empty state */}
                {events.length === 0 && (
                    <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                        <CalendarDays className="mx-auto h-12 w-12 text-slate-300" />
                        <p className="mt-2 text-sm text-slate-500">Nema aktivnosti za prikaz u kalendaru</p>
                        <p className="text-xs text-slate-400">Dodajte aktivnosti u vaš plan putovanja</p>
                    </div>
                )}
            </div>
        </div>
    );
}