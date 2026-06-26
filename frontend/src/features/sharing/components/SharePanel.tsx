import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { QrCode, Copy, Trash2, Plus, Eye, Edit } from 'lucide-react';
import { sharingApi } from '../api/sharingApi';
import type { ShareToken } from '../types/ShareToken';
import QRCode from 'react-qr-code';

interface Props {
    travelPlanId: number;
}

export default function SharePanel({ travelPlanId }: Props) {
    const [tokens, setTokens] = useState<ShareToken[]>([]);
    const [accessLevel, setAccessLevel] = useState('View');
    const [isCreating, setIsCreating] = useState(false);
    const [expandedToken, setExpandedToken] = useState<string | null>(null);

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
        const url = buildShareUrl(token);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
        } else {
            const el = document.createElement('textarea');
            el.value = url;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        }
        toast.success('Link je kopiran.');
    };

    return (
        <div className="rounded-xl border-l-4 border-blue-700 bg-white p-6 shadow-sm">
            <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-blue-900">
                <QrCode className="h-5 w-5 text-yellow-500" />
                Dijeljenje plana
            </h2>
            <p className="mb-4 text-xs text-slate-400">Kreirajte link ili QR kod za dijeljenje ovog plana sa drugima.</p>

            <div className="mb-6 flex items-center gap-2">
                <select
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                    <option value="View">👁️ Samo pregled</option>
                    <option value="Edit">✏️ Pregled i uređivanje</option>
                </select>
                <button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="flex items-center gap-1 rounded-lg bg-yellow-400 px-3 py-2 text-sm font-medium text-blue-900 hover:bg-yellow-300 disabled:opacity-50"
                >
                    <Plus className="h-4 w-4" />
                    Kreiraj link
                </button>
            </div>

            {tokens.length === 0 ? (
                <p className="text-sm text-slate-400">Nemate aktivnih linkova za dijeljenje.</p>
            ) : (
                <div className="space-y-3">
                    {tokens.map((t) => (
                        <div key={t.token} className="overflow-hidden rounded-lg border border-slate-200">
                            <div
                                className="flex cursor-pointer items-center justify-between bg-slate-50 p-3 hover:bg-slate-100"
                                onClick={() => setExpandedToken(expandedToken === t.token ? null : t.token)}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${t.accessLevel === 'Edit'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {t.accessLevel === 'Edit'
                                            ? <><Edit className="h-3 w-3" /> Uređivanje</>
                                            : <><Eye className="h-3 w-3" /> Pregled</>
                                        }
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                        <QrCode className="h-3 w-3" />
                                        Klikni za QR kod
                                    </span>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleCopy(t.token); }}
                                        className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                                    >
                                        <Copy className="h-3 w-3" /> Kopiraj link
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRevoke(t.token); }}
                                        className="flex items-center gap-1 text-xs text-red-600 hover:underline"
                                    >
                                        <Trash2 className="h-3 w-3" /> Opozovi
                                    </button>
                                </div>
                            </div>
                            {expandedToken === t.token && (
                                <div className="flex flex-col items-center gap-3 border-t border-slate-100 bg-white p-6">
                                    <QRCode value={buildShareUrl(t.token)} size={180} />
                                    <p className="text-xs text-slate-400">Skenirajte QR kod ili kopirajte link iznad</p>
                                    <p className="max-w-xs break-all text-center text-xs text-slate-500">
                                        {buildShareUrl(t.token)}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}