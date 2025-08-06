import React, { useState, useEffect } from 'react';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (currentPin: string, newPin: string) => Promise<any>;
}

const PasswordInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string, onToggleVisibility: () => void, show: boolean}> = ({label, id, onToggleVisibility, show, ...props}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <div className="relative">
            <input
                id={id}
                type={show ? 'text' : 'password'}
                {...props}
                className="form-input block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2.5 pr-10 text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors disabled:bg-slate-50"
            />
            <button
                type="button"
                onClick={onToggleVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                aria-label={show ? 'Ocultar' : 'Mostrar'}
                disabled={props.disabled}
            >
                <span className="material-icons cursor-pointer select-none text-xl text-slate-500 hover:text-slate-700">
                    {show ? 'visibility_off' : 'visibility'}
                </span>
            </button>
        </div>
    </div>
);


const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmNewPin, setConfirmNewPin] = useState('');
    const [showPins, setShowPins] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setCurrentPin('');
            setNewPin('');
            setConfirmNewPin('');
            setShowPins(false);
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        if (newPin.length < 3) {
             setError('La nueva contraseña debe tener al menos 3 caracteres.');
             return;
        }
        if (newPin !== confirmNewPin) {
            setError('La nueva contraseña y su confirmación no coinciden.');
            return;
        }
        setIsLoading(true);
        try {
            await onSubmit(currentPin, newPin);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0" onClick={isLoading ? undefined : onClose} aria-hidden="true"></div>
            <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
                <div className="flex items-start justify-between p-6 border-b border-slate-200">
                    <h2 id="modal-title" className="text-xl font-bold text-slate-900">Cambiar Contraseña</h2>
                    <button onClick={onClose} aria-label="Cerrar" className="-mt-2 -mr-2 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800" disabled={isLoading}>
                        <span className="material-icons">close</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <PasswordInput
                            label="Contraseña / PIN Actual"
                            id="currentPin"
                            value={currentPin}
                            onChange={(e) => setCurrentPin(e.target.value)}
                            onToggleVisibility={() => setShowPins(!showPins)}
                            show={showPins}
                            placeholder="Ingrese su contraseña actual"
                            required
                            disabled={isLoading}
                        />
                        <PasswordInput
                            label="Nueva Contraseña / PIN"
                            id="newPin"
                            value={newPin}
                            onChange={(e) => setNewPin(e.target.value)}
                            onToggleVisibility={() => setShowPins(!showPins)}
                            show={showPins}
                            placeholder="Ingrese una nueva contraseña"
                            required
                            disabled={isLoading}
                        />
                        <PasswordInput
                            label="Confirmar Nueva Contraseña / PIN"
                            id="confirmNewPin"
                            value={confirmNewPin}
                            onChange={(e) => setConfirmNewPin(e.target.value)}
                            onToggleVisibility={() => setShowPins(!showPins)}
                            show={showPins}
                            placeholder="Confirme la nueva contraseña"
                            required
                            disabled={isLoading}
                        />
                        {error && (
                            <div className="rounded-md bg-red-50 p-3">
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-3 p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                        <button type="button" onClick={onClose} disabled={isLoading} className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-700 ring-1 ring-slate-300 transition-colors duration-150 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isLoading} className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                            {isLoading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;