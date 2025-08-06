import React, { useState, useEffect } from 'react';
import { TaskData } from './ProductionTrackerPage';
import UnproductiveCauseHeader from '../components/UnproductiveCauseHeader';
import { UserInfo } from '../App';

interface CauseCategory {
    name: string;
    icon: string;
    iconColor?: string;
    subCauses: string[];
}

interface DowntimeReason {
    id: number;
    codigo: string;
    categoria: string;
    nombre_causa: string;
}

interface UnproductiveCausePageProps {
  task: TaskData;
  onBack: () => void;
  onLogout: () => void;
  onRegisterUnproductiveCause: (taskId: string, cause: string, observations: string) => void;
  onChangePassword: () => void;
  currentUser: UserInfo | null;
}

const UnproductiveCausePage: React.FC<UnproductiveCausePageProps> = ({ task, onBack, onLogout, onRegisterUnproductiveCause, onChangePassword, currentUser }) => {
    const [selectedCategory, setSelectedCategory] = useState<CauseCategory | null>(null);
    const [selectedSubCause, setSelectedSubCause] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [observations, setObservations] = useState('');

    const [causeCategories, setCauseCategories] = useState<CauseCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getIconForCategory = (categoryName: string): string => {
        const name = categoryName.toLowerCase();
        if (name.includes('equipo')) return 'settings';
        if (name.includes('material') || name.includes('herramental')) return 'construction';
        if (name.includes('proceso')) return 'science';
        if (name.includes('personal')) return 'engineering';
        return 'more_horiz';
    };

    useEffect(() => {
        const fetchCauses = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:3001/api/downtime/reasons');
                if (!response.ok) {
                    throw new Error('No se pudieron cargar las causas de inactividad.');
                }
                const data: DowntimeReason[] = await response.json();

                const groupedByCategory = data.reduce((acc, cause) => {
                    if (!acc[cause.categoria]) {
                        acc[cause.categoria] = [];
                    }
                    acc[cause.categoria].push(cause.nombre_causa);
                    return acc;
                }, {} as Record<string, string[]>);

                const formattedCategories: CauseCategory[] = Object.keys(groupedByCategory).map(categoryName => ({
                    name: categoryName,
                    icon: getIconForCategory(categoryName),
                    subCauses: groupedByCategory[categoryName].sort(),
                }));
                
                setCauseCategories(formattedCategories.sort((a,b) => a.name.localeCompare(b.name)));

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCauses();
    }, []);


    const handleCategoryClick = (category: CauseCategory) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
        setSelectedSubCause(null); // Reset sub-cause when category is clicked
    };

    const handleSubCauseSelect = (subCause: string) => {
        setSelectedSubCause(subCause);
        setIsModalOpen(false);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        // Do not reset category selection on close
    };

    const handleRegister = () => {
        if (!selectedSubCause) {
            alert('Por favor, seleccione una causa antes de registrar.');
            return;
        }
        const cause = selectedSubCause;
        onRegisterUnproductiveCause(task.id, cause, observations);
    };
    
    const openModalForSelectedCategory = () => {
        if(selectedCategory) {
            setIsModalOpen(true);
        }
    }

    const renderCategoryButtons = () => {
        if (isLoading) {
            return <p className="text-slate-500">Cargando categorías...</p>;
        }
        if (error) {
            return <p className="text-red-500">Error: {error}</p>;
        }
        if (causeCategories.length === 0) {
            return <p className="text-slate-500">No hay categorías de inactividad configuradas.</p>;
        }
        return (
             <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {causeCategories.map((category) => (
                   <CategoryButton 
                        key={category.name}
                        category={category}
                        isSelected={selectedCategory?.name === category.name}
                        onClick={() => handleCategoryClick(category)}
                   />
                ))}
            </div>
        )
    }

    return (
        <div className="layout-container flex h-full grow flex-col">
            <UnproductiveCauseHeader onBack={onBack} onLogout={onLogout} onChangePassword={onChangePassword} currentUser={currentUser} />
            <main className="flex flex-1 justify-center py-8 px-4">
                <div className="layout-content-container flex w-full max-w-2xl flex-col rounded-xl bg-white p-6 shadow-lg md:p-8">
                    <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight text-slate-900">Registrar Causa Improductiva</h1>
                    
                    <div className="mb-6 grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                        <InfoField label="Orden Fab." value={task.id} />
                        <InfoField label="Máquina" value={task.equipment} />
                        <InfoField label="Operador" value={currentUser?.codigo_operario || 'N/A'} />
                        <InfoField label="Fecha/Hora de Inicio" value={new Date().toLocaleString('es-ES')} />
                    </div>

                    <h2 className="mb-4 text-xl font-semibold leading-tight tracking-tight text-slate-800">1. Seleccione una Categoría</h2>
                    {renderCategoryButtons()}
                    
                    {selectedSubCause && selectedCategory && (
                        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <h2 className="text-xl font-semibold leading-tight tracking-tight text-slate-800 mb-2">2. Causa Seleccionada</h2>
                            <div className="flex items-center gap-2 text-blue-800">
                                 <span className={`material-icons text-xl`}>{selectedCategory.icon}</span>
                                 <p className="font-medium">
                                    {selectedCategory.name} &gt; <span className="font-bold">{selectedSubCause}</span>
                                 </p>
                            </div>
                            <button 
                                onClick={openModalForSelectedCategory} 
                                className="mt-2 text-sm font-semibold text-blue-600 hover:underline"
                            >
                                Cambiar selección
                            </button>
                        </div>
                    )}

                    <div className="mb-6 flex flex-col">
                        <label htmlFor="observations" className="pb-1.5 text-sm font-medium leading-normal text-slate-700">3. Observaciones (Opcional)</label>
                        <div className="relative">
                            <textarea id="observations" value={observations} onChange={(e) => setObservations(e.target.value)} className="form-input min-h-28 w-full min-w-0 flex-1 resize-y overflow-hidden rounded-md border border-slate-300 bg-white p-3 pr-20 text-sm font-normal leading-normal text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-0 focus:ring-1 focus:ring-blue-500" placeholder="Ingrese observaciones aquí..."></textarea>
                            <div className="absolute bottom-2 right-2 flex gap-1">
                                <button aria-label="Usar teclado" className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600">
                                    <span className="material-icons text-lg">keyboard</span>
                                </button>
                                <button aria-label="Usar micrófono" className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-blue-600">
                                    <span className="material-icons text-lg">mic</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 flex flex-col justify-end gap-3 sm:flex-row">
                        <button onClick={onBack} className="flex h-11 min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-md bg-white px-4 text-sm font-semibold leading-normal tracking-[0.015em] text-slate-700 ring-1 ring-slate-300 transition-colors duration-150 hover:bg-slate-50">
                            <span className="truncate">Cancelar</span>
                        </button>
                        <button onClick={handleRegister} disabled={!selectedSubCause} className="flex h-11 min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-md bg-red-600 px-4 text-sm font-semibold leading-normal tracking-[0.015em] text-white transition-colors duration-150 hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                            <span className="material-icons text-lg">app_registration</span>
                            <span className="truncate">Registrar</span>
                        </button>
                    </div>
                </div>

                {isModalOpen && selectedCategory && (
                    <SubCauseModal 
                        category={selectedCategory}
                        onSelect={handleSubCauseSelect}
                        onClose={handleCloseModal}
                    />
                )}
            </main>
        </div>
    );
};

const InfoField: React.FC<{label: string, value: string}> = ({ label, value }) => (
    <div className="flex flex-col">
        <label className="pb-1.5 text-sm font-medium leading-normal text-slate-700">{label}</label>
        <input className="form-input h-11 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-md border border-slate-300 bg-slate-50 p-3 text-sm font-normal leading-normal text-slate-900 placeholder:text-slate-400 focus:outline-0" disabled value={value}/>
    </div>
);

const CategoryButton: React.FC<{category: CauseCategory, isSelected: boolean, onClick: () => void}> = ({ category, isSelected, onClick }) => {
    const selectedClasses = 'bg-blue-50 border-blue-600 ring-2 ring-blue-500';
    return (
        <button onClick={onClick} className={`flex h-28 flex-col items-center justify-center gap-2 rounded-lg border p-2 text-center transition-colors duration-150 hover:border-blue-500 hover:bg-slate-50 focus:outline-none ${isSelected ? selectedClasses : 'border-slate-300'}`}>
            <span className={`material-icons text-3xl ${category.iconColor || 'text-slate-600'}`}>{category.icon}</span>
            <span className="text-center text-sm font-medium text-slate-700">{category.name}</span>
        </button>
    )
}

const SubCauseModal: React.FC<{
    category: CauseCategory,
    onSelect: (subCause: string) => void,
    onClose: () => void
}> = ({ category, onSelect, onClose }) => {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0" onClick={onClose} aria-hidden="true"></div>
            <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl m-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 id="modal-title" className="text-2xl font-bold text-slate-900">{category.name}</h2>
                        <p className="mt-1 text-sm text-slate-500">Seleccione una causa específica</p>
                    </div>
                    <button onClick={onClose} aria-label="Cerrar" className="-mt-2 -mr-2 flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                        <span className="material-icons">close</span>
                    </button>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {category.subCauses.map(subCause => (
                        <button 
                            key={subCause}
                            onClick={() => onSelect(subCause)}
                            className="flex h-24 flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-center text-sm font-medium text-slate-700 transition-colors hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {subCause}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default UnproductiveCausePage;