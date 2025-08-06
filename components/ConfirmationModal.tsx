
import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (() => void) | undefined;
    title: string;
    message: React.ReactNode;
    confirmButtonText: string;
    confirmButtonClass: string;
    isLoading: boolean;
    icon?: string;
    iconClass?: string;
    cancelButtonText?: string;
    onCancel?: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmButtonText,
    confirmButtonClass,
    isLoading,
    icon = 'help_outline',
    iconClass = 'text-blue-600 bg-blue-100',
    cancelButtonText,
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0" onClick={isLoading ? undefined : onClose} aria-hidden="true"></div>
            <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
                <div className="flex items-start gap-4 p-6">
                    <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${iconClass}`}>
                        <span className="material-icons text-2xl" aria-hidden="true">{icon}</span>
                    </div>
                    <div>
                        <h2 id="modal-title" className="text-xl font-bold text-slate-900">{title}</h2>
                        <div className="mt-2 text-sm text-slate-600">
                            {message}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition-colors duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {cancelButtonText || 'Cancelar'}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex h-10 min-w-[84px] cursor-pointer items-center justify-center rounded-md px-4 text-sm font-semibold text-white transition-colors duration-150 disabled:bg-slate-400 disabled:cursor-not-allowed ${confirmButtonClass}`}
                    >
                        {isLoading ? 'Procesando...' : confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;