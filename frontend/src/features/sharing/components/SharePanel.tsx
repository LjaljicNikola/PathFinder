import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { sharingApi } from '../api/sharingApi';
import type { ShareToken } from '../types/ShareToken';

interface Props {
    travelPlanId: number;
}

export default function SharePanel({ travelPlanId }: Props) {
    const [tokens, setTokens] = useState<ShareToken[]>([]);
    const [accessLevel, setAccessLevel] = useState('View');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line
        loadTokens();
    }, [travelPlanId]);

    const loadTokens = async () => {
        try {
            const data = await sharingApi.getTokensForPlan(travelPlanId);
            setTokens(data);
        } catch {
            toast.error('Greška prilikom učitavanja linkova za dijeljenje.');
        }
    };

    const handleCreate = async () => {
        setIsCreating(true);
        try {
            await sharingApi.createToken(travelPlanId, accessLevel);
            toast.success('Link za dijeljenje je kreiran.');
            void loadTokens();
        } catch {
            toast.error('Greška prilikom kreiranja linka.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleRevoke = async (token: string) => {
        if (!window.confirm('Opozvati ovaj link?')) return;
        try {
            await sharingApi.revokeToken(token);
            toast.success('Link je opozvan.');
            void loadTokens();
        } catch {
            toast.error('Greška prilikom opoziva linka.');
        }
    };

    const buildShareUrl = (token: string) => `${window.location.origin}/deljeno/${token}`;

    const handleCopy = (token: string) => {
        navigator.clipboard.writeText(buildShareUrl(token));
        toast.success('Link je kopiran.');
    };

    return (
        <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-slate-800">Dijeljenje plana</h2>

            <div className="mb-4 flex items-center gap-2">
                <select
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value)}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
                >
                    <option value="View">Samo pregled</option>
                    <option value="Edit">Pregled i uređivanje</option>
                </select>
                <button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                    Kreiraj link
                </button>
            </div>

            {tokens.length === 0 ? (
                <p className="text-sm text-slate-500">Nema aktivnih linkova za dijeljenje.</p>
            ) : (
                <ul className="space-y-2">
                    {tokens.map((t) => (
                        <li key={t.token} className="flex items-center justify-between rounded-md border border-slate-200 p-2 text-sm">
                            <div>
                                <span className="font-mono text-xs text-slate-500">{t.token.slice(0, 16)}...</span>
                                <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs">
                                    {t.accessLevel === 'Edit' ? 'Uređivanje' : 'Pregled'}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleCopy(t.token)} className="text-xs text-indigo-600 hover:underline">
                                    Kopiraj link
                                </button>
                                <button onClick={() => handleRevoke(t.token)} className="text-xs text-red-600 hover:underline">
                                    Opozovi
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}