// frontend/src/components/ConfirmationModal.tsx
import type { ReactNode } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'danger' | 'warning' | 'info';
    children?: ReactNode;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Obrisi',
    cancelText = 'Odustani',
    confirmVariant = 'danger',
    children,
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const variantColors = {
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
        info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    };

    const variantIcon = {
        danger: 'text-red-600',
        warning: 'text-yellow-600',
        info: 'text-blue-600',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`rounded-full p-2 ${variantIcon[confirmVariant] === 'text-red-600' ? 'bg-red-100' : variantIcon[confirmVariant] === 'text-yellow-600' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                            <AlertCircle className={`h-6 w-6 ${variantIcon[confirmVariant]}`} />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="mt-4">
                    <p className="text-sm text-slate-600">{message}</p>
                    {children && <div className="mt-3">{children}</div>}
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${variantColors[confirmVariant]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}