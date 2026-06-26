import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { QrCode, Copy, Eye, Edit, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { sharingApi } from '../api/sharingApi';
import type { ShareToken } from '../types/ShareToken';
import QRCode from 'react-qr-code';

interface Props {
    travelPlanId: number;
}

export default function SharePanel({ travelPlanId }: Props) {
    const [tokens, setTokens] = useState<ShareToken[]>([]);
    const [copiedToken, setCopiedToken] = useState<string | null>(null);
    const [regenerating, setRegenerating] = useState<string | null>(null);

    useEffect(() => {
        const loadTokens = async () => {
            try {
                const data = await sharingApi.getTokensForPlan(travelPlanId);
                setTokens(data);
            } catch {
                toast.error('Greska prilikom ucitavanja linkova.');
            }
        };

        loadTokens();
    }, [travelPlanId]);

    useEffect(() => {
        const createTokensIfMissing = async () => {
            if (tokens.length === 0) {
                try {
                    await sharingApi.createToken(travelPlanId, 'View');
                    await sharingApi.createToken(travelPlanId, 'Edit');
                    const data = await sharingApi.getTokensForPlan(travelPlanId);
                    setTokens(data);
                } catch {
                    toast.error('Greska prilikom kreiranja linkova.');
                }
            }
        };

        createTokensIfMissing();
    }, [tokens.length, travelPlanId]);

    const handleRegenerate = async (accessLevel: string) => {
        setRegenerating(accessLevel);
        try {
            const existing = tokens.find(t => t.accessLevel === accessLevel);
            if (existing) {
                await sharingApi.revokeToken(existing.token);
            }
            await sharingApi.createToken(travelPlanId, accessLevel);
            const data = await sharingApi.getTokensForPlan(travelPlanId);
            setTokens(data);
            toast.success(`Link za ${accessLevel === 'View' ? 'pregled' : 'uređivanje'} je obnovljen.`);
        } catch {
            toast.error('Greska prilikom obnavljanja linka.');
        } finally {
            setRegenerating(null);
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
        setCopiedToken(token);
        toast.success('Link je kopiran!');
        setTimeout(() => setCopiedToken(null), 3000);
    };

    const getTokenByLevel = (level: string) => tokens.find(t => t.accessLevel === level);

    const renderShareCard = (level: 'View' | 'Edit') => {
        const token = getTokenByLevel(level);
        const isView = level === 'View';
        const label = isView ? 'Pregled' : 'Uređivanje';
        const icon = isView ? <Eye className="h-5 w-5" /> : <Edit className="h-5 w-5" />;
        const bgColor = isView ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200';
        const titleColor = isView ? 'text-blue-700' : 'text-green-700';
        const borderColor = isView ? 'border-blue-300' : 'border-green-300';

        if (!token) {
            return (
                <div className={`rounded-xl border-2 ${bgColor} ${borderColor} p-5`}>
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                        <span className="text-sm text-slate-500">Kreiram link...</span>
                    </div>
                </div>
            );
        }

        return (
            <div className={`rounded-xl border-2 ${bgColor} ${borderColor} p-5 transition-all hover:shadow-md`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`rounded-full p-2 ${isView ? 'bg-blue-100' : 'bg-green-100'}`}>
                            {icon}
                        </div>
                        <div>
                            <h3 className={`font-semibold ${titleColor}`}>
                                Link za {label.toLowerCase()}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {isView ? 'Samo pregled plana' : 'Pregled i uređivanje plana'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleCopy(token.token)}
                            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${copiedToken === token.token
                                    ? 'bg-green-600 text-white'
                                    : 'bg-white text-slate-700 hover:bg-slate-100'
                                }`}
                        >
                            {copiedToken === token.token ? (
                                <><Check className="h-3 w-3" /> Kopirano</>
                            ) : (
                                <><Copy className="h-3 w-3" /> Kopiraj</>
                            )}
                        </button>
                        <button
                            onClick={() => handleRegenerate(level)}
                            disabled={regenerating === level}
                            className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                        >
                            {regenerating === level ? (
                                <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-600 border-t-transparent" />
                            ) : (
                                <RefreshCw className="h-3 w-3" />
                            )}
                            Obnovi
                        </button>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-6 border-t pt-4">
                    <div className="flex-shrink-0 cursor-pointer" onClick={() => handleCopy(token.token)}>
                        <div className="rounded-xl bg-white p-3 shadow-sm transition hover:shadow-md">
                            <QRCode value={buildShareUrl(token.token)} size={120} />
                        </div>
                        <p className="mt-1 text-center text-[10px] text-slate-400">Klikni na QR za kopiranje</p>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={buildShareUrl(token.token)}
                                readOnly
                                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 outline-none truncate cursor-pointer"
                                onClick={(e) => {
                                    (e.target as HTMLInputElement).select();
                                    handleCopy(token.token);
                                }}
                            />
                            <a
                                href={buildShareUrl(token.token)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-300 transition-colors"
                            >
                                <ExternalLink className="h-3 w-3" />
                                Otvori
                            </a>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                            Skenirajte QR kod ili kopirajte link za deljenje
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="rounded-xl border-l-4 border-blue-700 bg-white p-6 shadow-sm">
            <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-blue-900">
                <QrCode className="h-5 w-5 text-yellow-500" />
                Deljenje plana
            </h2>
            <p className="mb-4 text-xs text-slate-400">
                Linkovi se automatski kreiraju. Dijelite ih sa drugima za pregled ili uređivanje plana.
            </p>

            <div className="space-y-4">
                {renderShareCard('View')}
                {renderShareCard('Edit')}
            </div>
        </div>
    );
}