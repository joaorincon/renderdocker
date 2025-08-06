import React from 'react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userName: string;
    isLoading: boolean;
    error: string | null;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, userName, isLoading, error }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0" onClick={isLoading ? undefined : onClose} aria-hidden="true"></div>
            <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
                <div className="flex items-start gap-4 p-6">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                        <span className="material-icons text-red-600" aria-hidden="true">warning_amber</span>
                    </div>
                    <div>
                        <h2 id="modal-title" className="text-xl font-bold text-slate-900">Eliminar Usuario</h2>
                        <p className="mt-2 text-sm text-slate-600">
                            ¿Estás seguro de que quieres eliminar a <strong className="font-semibold">{userName}</strong>? Esta acción no se puede deshacer.
                        </p>
                    </div>
                </div>
                {error && (
                    <div className="px-6 pb-4">
                        <div className="rounded-md bg-red-50 p-3">
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                    </div>
                )}
                <div className="flex justify-end gap-3 p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition-colors duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Eliminando...' : 'Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
