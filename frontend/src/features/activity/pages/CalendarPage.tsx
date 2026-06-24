import { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { toast } from 'react-toastify';
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
            },
        };
    };

    if (isLoading) return <div className="p-8 text-slate-500">Učitavanje...</div>;

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="mx-auto max-w-5xl">
                <h1 className="mb-6 text-2xl font-semibold text-slate-800">Kalendar aktivnosti</h1>
                <Link
                    to={`/planovi/${id}`}
                    className="mb-4 inline-block text-sm text-indigo-600 hover:underline"
                >
                    ← Nazad na plan
                </Link>
                <div className="rounded-xl bg-white p-6 shadow-sm" style={{ height: '600px' }}>
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
                    />
                </div>
                <div className="mt-4 flex gap-4 text-sm">
                    <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-indigo-500"></span>Planirano</span>
                    <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-sky-500"></span>Rezervisano</span>
                    <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-green-500"></span>Završeno</span>
                    <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-red-500"></span>Otkazano</span>
                </div>
            </div>
        </div>
    );
}