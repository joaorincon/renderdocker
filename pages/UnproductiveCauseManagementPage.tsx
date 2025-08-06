
import React, { useState, useEffect, useMemo } from 'react';
import SupervisorSubPageHeader from '../components/SupervisorSubPageHeader';
import { UserInfo, UserRole } from '../App';

// --- TYPES ---
interface DowntimeReason {
    id: number;
    codigo: string;
    categoria: string;
    downtime_reasons_categories_id: number;
    nombre_causa: string;
    descripcion: string | null;
    is_active: boolean;
}
interface Category {
    id: number;
    nombre_categoria: string;
    descripcion: string | null;
}
interface GroupedReason {
    [key: string]: DowntimeReason[];
}
type ModalState = 
    | { type: 'close' }
    | { type: 'add_reason' }
    | { type: 'edit_reason', reason: DowntimeReason }
    | { type: 'delete_reason', reason: DowntimeReason }
    | { type: 'add_category' }
    | { type: 'edit_category', category: Category }
    | { type: 'delete_category', category: Category };


// --- GLOBAL STYLES ---
const globalStyles = `
.btn-primary {
    display: flex;
    height: 2.5rem;
    min-width: 5.25rem;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    background-color: #2563eb;
    padding-left: 1rem;
    padding-right: 1rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 600;
    color: #ffffff;
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
}
.btn-primary:hover {
    background-color: #1d4ed8;
}
.btn-primary:disabled {
    background-color: #94a3b8;
    cursor: not-allowed;
}

.btn-secondary {
    display: flex;
    height: 2.5rem;
    min-width: 5.25rem;
    cursor: pointer;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    background-color: #ffffff;
    padding-left: 1rem;
    padding-right: 1rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    font-weight: 600;
    color: #334155;
    border: 1px solid #cbd5e1;
    transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
}
.btn-secondary:hover {
    background-color: #f8fafc;
}
.btn-secondary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
`;
const GlobalStylesInjector: React.FC = () => <style>{globalStyles}</style>;


// --- PAGE COMPONENT ---
const UnproductiveCauseManagementPage: React.FC<{
    onBack: () => void;
    onLogout: () => void;
    currentUser: UserInfo | null;
    onChangePassword: () => void;
    userRole: UserRole | null;
}> = ({ onBack, onLogout, currentUser, onChangePassword, userRole }) => {
    const [reasons, setReasons] = useState<DowntimeReason[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalState, setModalState] = useState<ModalState>({ type: 'close' });
    
    const canManageCauses = userRole === 'root' || userRole === 'admin_planta';

    const groupedReasons = useMemo(() => {
        return reasons.reduce((acc, reason) => {
            const categoryName = reason.categoria || 'Sin Categoría';
            (acc[categoryName] = acc[categoryName] || []).push(reason);
            return acc;
        }, {} as GroupedReason);
    }, [reasons]);

    const sortedCategories = useMemo(() => Object.keys(groupedReasons).sort(), [groupedReasons]);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [reasonsRes, categoriesRes] = await Promise.all([
                fetch('http://localhost:3001/api/downtime/management-data'),
                fetch('http://localhost:3001/api/downtime/categories')
            ]);
            if (!reasonsRes.ok || !categoriesRes.ok) throw new Error('Failed to fetch data.');
            
            const reasonsData: DowntimeReason[] = await reasonsRes.json();
            const categoriesData: Category[] = await categoriesRes.json();

            setReasons(reasonsData);
            setCategories(categoriesData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSuccess = () => {
        fetchData();
        setModalState({ type: 'close' });
    }

    const renderReasonsContent = () => {
        if (isLoading) return <div className="text-center p-8">Cargando causas...</div>;
        if (reasons.length === 0 && !isLoading) return <div className="text-center p-8 text-slate-500">No hay causas de inactividad para mostrar.</div>;

        return (
            <div className="space-y-3">
                {sortedCategories.map(category => (
                    <details key={category} className="group bg-white border border-slate-200 rounded-lg overflow-hidden" open>
                        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50">
                            <div className='flex items-center gap-3'>
                                <span className="material-icons text-slate-500 transition-transform duration-300 group-open:rotate-90">chevron_right</span>
                                <h3 className="font-semibold text-slate-800 text-lg">{category}</h3>
                                <span className="text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{groupedReasons[category].length}</span>
                            </div>
                        </summary>
                        <div className="border-t border-slate-200">
                           <ReasonTable reasons={groupedReasons[category]} onEdit={(reason) => setModalState({type: 'edit_reason', reason})} onDelete={(reason) => setModalState({type: 'delete_reason', reason})} canManage={canManageCauses}/>
                        </div>
                    </details>
                ))}
            </div>
        );
    };

    return (
        <>
            <GlobalStylesInjector />
            <div className="flex h-full min-h-screen flex-col bg-slate-100">
                <SupervisorSubPageHeader onBack={onBack} onLogout={onLogout} title="Gestionar Causas Improductivas" onChangePassword={onChangePassword} currentUser={currentUser} />
                <main className="flex-1 justify-center py-8 px-4 sm:px-6 md:px-10">
                    <div className="max-w-5xl mx-auto space-y-8">
                        {/* --- Category Management Section --- */}
                        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900">{canManageCauses ? "Gestión de Categorías" : "Lista de Categorías"}</h2>
                                {canManageCauses && (
                                    <button onClick={() => setModalState({ type: 'add_category' })} className="btn-primary flex items-center gap-2">
                                        <span className="material-icons text-lg">add</span>
                                        Añadir Categoría
                                    </button>
                                )}
                            </div>
                            <CategoryTable categories={categories} onEdit={cat => setModalState({type: 'edit_category', category: cat})} onDelete={cat => setModalState({type: 'delete_category', category: cat})} isLoading={isLoading} canManage={canManageCauses} />
                        </div>
                        {/* --- Reason Management Section --- */}
                        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-900">Causas por Categoría</h2>
                                {canManageCauses && (
                                    <button onClick={() => setModalState({ type: 'add_reason' })} className="btn-primary flex items-center gap-2">
                                        <span className="material-icons text-lg">add</span>
                                        Añadir Causa
                                    </button>
                                )}
                            </div>
                            {error ? <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div> : renderReasonsContent()}
                        </div>
                    </div>
                </main>
            </div>
            
            {/* --- MODALS --- */}
            {(modalState.type === 'add_reason' || modalState.type === 'edit_reason') && (
                <ReasonModal
                    isOpen
                    onClose={() => setModalState({ type: 'close' })}
                    onSuccess={handleSuccess}
                    reasonToEdit={modalState.type === 'edit_reason' ? modalState.reason : undefined}
                    categories={categories}
                />
            )}
             {(modalState.type === 'add_category' || modalState.type === 'edit_category') && (
                <CategoryModal
                    isOpen
                    onClose={() => setModalState({ type: 'close' })}
                    onSuccess={handleSuccess}
                    categoryToEdit={modalState.type === 'edit_category' ? modalState.category : undefined}
                />
            )}
            {modalState.type === 'delete_reason' && (
                <DeleteModalWrapper type="reason" item={modalState.reason} isOpen onClose={() => setModalState({ type: 'close' })} onSuccess={handleSuccess} />
            )}
            {modalState.type === 'delete_category' && (
                 <DeleteModalWrapper type="category" item={modalState.category} isOpen onClose={() => setModalState({ type: 'close' })} onSuccess={handleSuccess} />
            )}
        </>
    );
};

// --- CHILD COMPONENTS (within the same file) ---
const CategoryTable: React.FC<{
    categories: Category[],
    onEdit: (c: Category) => void,
    onDelete: (c: Category) => void,
    isLoading: boolean,
    canManage: boolean
}> = ({categories, onEdit, onDelete, isLoading, canManage}) => {
    if (isLoading) return <div className="text-center p-4">Cargando...</div>
    if (categories.length === 0 && !isLoading) return <div className="text-center p-4 text-slate-500">No hay categorías.</div>

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Nombre Categoría</th>
                        <th scope="col" className="px-6 py-3">Descripción</th>
                        {canManage && <th scope="col" className="px-6 py-3 text-right">Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {categories.map(cat => (
                        <tr key={cat.id} className="bg-white border-b last:border-b-0 hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-800">{cat.nombre_categoria}</td>
                            <td className="px-6 py-4 text-slate-600">{cat.descripcion || '-'}</td>
                            {canManage && (
                                <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                    <button onClick={() => onEdit(cat)} className="font-medium text-blue-600 hover:underline">Editar</button>
                                    <button onClick={() => onDelete(cat)} className="font-medium text-red-600 hover:underline">Eliminar</button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}


const ReasonTable: React.FC<{reasons: DowntimeReason[], onEdit: (r: DowntimeReason) => void, onDelete: (r: DowntimeReason) => void, canManage: boolean}> = ({reasons, onEdit, onDelete, canManage}) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                    <th scope="col" className="px-6 py-3">Código</th>
                    <th scope="col" className="px-6 py-3">Nombre de la Causa</th>
                    <th scope="col" className="px-6 py-3">Estado</th>
                    {canManage && <th scope="col" className="px-6 py-3 text-right">Acciones</th>}
                </tr>
            </thead>
            <tbody>
                {reasons.map(reason => (
                    <tr key={reason.id} className="bg-white border-b last:border-b-0 hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono text-xs">{reason.codigo}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">{reason.nombre_causa}</td>
                        <td className="px-6 py-4">
                             <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${reason.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {reason.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                        </td>
                        {canManage && (
                            <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                <button onClick={() => onEdit(reason)} className="font-medium text-blue-600 hover:underline">Editar</button>
                                <button onClick={() => onDelete(reason)} className="font-medium text-red-600 hover:underline">Eliminar</button>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
)

const ReasonModal: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    onSuccess: () => void,
    reasonToEdit?: DowntimeReason,
    categories: Category[]
}> = ({ isOpen, onClose, onSuccess, reasonToEdit, categories }) => {
    const [codigo, setCodigo] = useState('');
    const [nombreCausa, setNombreCausa] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [categoriaId, setCategoriaId] = useState<number | string>('');
    const [isActive, setIsActive] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string|null>(null);

    const isEditMode = !!reasonToEdit;

    useEffect(() => {
        if(isOpen) {
            setCodigo(reasonToEdit?.codigo || '');
            setNombreCausa(reasonToEdit?.nombre_causa || '');
            setDescripcion(reasonToEdit?.descripcion || '');
            setCategoriaId(reasonToEdit?.downtime_reasons_categories_id || (categories.length > 0 ? categories[0].id : ''));
            setIsActive(reasonToEdit?.is_active ?? true);
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen, reasonToEdit, categories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!categoriaId) {
            setError('Por favor, seleccione una categoría.');
            return;
        }
        setIsLoading(true);
        
        const url = isEditMode ? `http://localhost:3001/api/downtime/reasons/${reasonToEdit.id}` : 'http://localhost:3001/api/downtime/reasons';
        const method = isEditMode ? 'PUT' : 'POST';
        const body = JSON.stringify({ 
            codigo, 
            nombre_causa: nombreCausa, 
            descripcion, 
            downtime_reasons_categories_id: categoriaId, 
            is_active: isActive 
        });

        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'An error occurred.');
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="fixed inset-0" onClick={isLoading ? undefined : onClose} aria-hidden="true"></div>
            <form onSubmit={handleSubmit} className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
                <div className="flex items-start justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">{isEditMode ? 'Editar Causa' : 'Añadir Nueva Causa'}</h2>
                    <button type="button" onClick={onClose} aria-label="Cerrar" className="-mt-2 -mr-2 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800" disabled={isLoading}>
                        <span className="material-icons">close</span>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="categoriaId" className="block text-sm font-medium text-slate-700 mb-1.5">Categoría</label>
                        <select id="categoriaId" value={categoriaId} onChange={e => setCategoriaId(Number(e.target.value))} required disabled={isLoading || categories.length === 0} className="form-select block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors disabled:bg-slate-100">
                            {categories.length > 0 ? (
                                categories.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre_categoria}</option>)
                            ) : (
                                <option disabled value="">No hay categorías creadas</option>
                            )}
                        </select>
                    </div>
                    <FormInput id="codigo" label="Código" value={codigo} onChange={e => setCodigo(e.target.value)} required disabled={isLoading} />
                    <FormInput id="nombreCausa" label="Nombre de la Causa" value={nombreCausa} onChange={e => setNombreCausa(e.target.value)} required disabled={isLoading} />
                     <div>
                        <label htmlFor="descripcion" className="block text-sm font-medium text-slate-700 mb-1.5">Descripción (Opcional)</label>
                        <textarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} disabled={isLoading} className="form-textarea min-h-24 block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors disabled:bg-slate-100"></textarea>
                    </div>

                    {isEditMode && <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Estado</label>
                        <ToggleSwitch checked={isActive} onChange={setIsActive} disabled={isLoading} />
                    </div>}
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                </div>
                <div className="flex justify-end gap-3 p-4 bg-slate-50 border-t rounded-b-xl">
                    <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary">Cancelar</button>
                    <button type="submit" disabled={isLoading} className="btn-primary">{isLoading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Añadir Causa')}</button>
                </div>
            </form>
        </div>
    )
}

const CategoryModal: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    onSuccess: () => void,
    categoryToEdit?: Category
}> = ({ isOpen, onClose, onSuccess, categoryToEdit }) => {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string|null>(null);

    const isEditMode = !!categoryToEdit;

     useEffect(() => {
        if(isOpen) {
            setNombre(categoryToEdit?.nombre_categoria || '');
            setDescripcion(categoryToEdit?.descripcion || '');
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen, categoryToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        const url = isEditMode ? `http://localhost:3001/api/downtime/categories/${categoryToEdit.id}` : 'http://localhost:3001/api/downtime/categories';
        const method = isEditMode ? 'PUT' : 'POST';
        const body = JSON.stringify({ nombre_categoria: nombre, descripcion });

        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'An error occurred.');
            onSuccess();
        } catch(err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }

    if (!isOpen) return null;

     return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="fixed inset-0" onClick={isLoading ? undefined : onClose} aria-hidden="true"></div>
            <form onSubmit={handleSubmit} className="relative w-full max-w-md rounded-xl bg-white shadow-2xl">
                 <div className="flex items-start justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">{isEditMode ? 'Editar Categoría' : 'Añadir Categoría'}</h2>
                    <button type="button" onClick={onClose} aria-label="Cerrar" className="-mt-2 -mr-2 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800" disabled={isLoading}>
                        <span className="material-icons">close</span>
                    </button>
                 </div>
                 <div className="p-6 space-y-4">
                    <FormInput id="cat-name" label="Nombre de la Categoría" value={nombre} onChange={e => setNombre(e.target.value)} required disabled={isLoading} />
                    <FormInput id="cat-desc" label="Descripción (Opcional)" value={descripcion} onChange={e => setDescripcion(e.target.value)} disabled={isLoading} />
                    {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                 </div>
                 <div className="flex justify-end gap-3 p-4 bg-slate-50 border-t rounded-b-xl">
                    <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary">Cancelar</button>
                    <button type="submit" disabled={isLoading} className="btn-primary">{isLoading ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Añadir Categoría')}</button>
                </div>
            </form>
        </div>
     )
}

const DeleteModalWrapper: React.FC<{
    type: 'reason' | 'category',
    item: DowntimeReason | Category,
    isOpen: boolean,
    onClose: () => void,
    onSuccess: () => void
}> = ({type, item, isOpen, onClose, onSuccess}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string|null>(null);

    const name = type === 'reason' ? (item as DowntimeReason).nombre_causa : (item as Category).nombre_categoria;
    const title = type === 'reason' ? 'Eliminar Causa' : 'Eliminar Categoría';
    const message = type === 'reason' 
        ? <>¿Estás seguro de que quieres eliminar la causa <strong>{name}</strong>?</>
        : <>¿Estás seguro de que quieres eliminar la categoría <strong>{name}</strong>? Esta acción fallará si hay causas asociadas a ella.</>
    
    const handleConfirm = async () => {
        setIsLoading(true);
        setError(null);
        
        const url = type === 'reason' ? `http://localhost:3001/api/downtime/reasons/${item.id}` : `http://localhost:3001/api/downtime/categories/${item.id}`;
        const method = 'DELETE';

        try {
            const res = await fetch(url, { method });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'An error occurred.');
            }
            onSuccess();
        } catch(err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }

    return <DeleteConfirmationModal 
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleConfirm}
        title={title}
        message={message}
        isLoading={isLoading}
        error={error}
    />
}

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string}> = ({label, id, ...props}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <input 
            id={id}
            {...props}
            className="form-input block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors disabled:bg-slate-100 disabled:text-slate-600"
        />
    </div>
);
const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean; }> = ({ checked, onChange, disabled }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        className={`${checked ? 'bg-blue-600' : 'bg-slate-300'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
    >
        <span
            aria-hidden="true"
            className={`${checked ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);

const DeleteConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
    isLoading: boolean;
    error: string | null;
}> = ({ isOpen, onClose, onConfirm, title, message, isLoading, error }) => {
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
                        <h2 id="modal-title" className="text-xl font-bold text-slate-900">{title}</h2>
                        <div className="mt-2 text-sm text-slate-600">
                            {message}
                        </div>
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
                    <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary">Cancelar</button>
                    <button type="button" onClick={onConfirm} disabled={isLoading} className="flex h-10 min-w-[84px] cursor-pointer items-center justify-center rounded-md bg-red-600 px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                        {isLoading ? 'Eliminando...' : 'Eliminar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UnproductiveCauseManagementPage;
