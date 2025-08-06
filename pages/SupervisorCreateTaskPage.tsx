



import React, { useState, useEffect } from 'react';
import SupervisorSubPageHeader from '../components/SupervisorSubPageHeader';
import CreateTaskForm from '../components/CreateTaskForm';
import { TaskData } from './ProductionTrackerPage';
import { UserInfo, ProductionOrderInfo, NewTaskPayload } from '../App';

interface SupervisorCreateTaskPageProps {
    onBack: () => void;
    onLogout: () => void;
    onInitiateCreateTask: (taskData: NewTaskPayload) => void;
    onChangePassword: () => void;
    currentUser: UserInfo | null;
    preselectedOrder: ProductionOrderInfo | null;
}

export interface MachineOption {
    id: number;
    nombre: string;
}

interface Operation {
    id: number;
    nombre_operacion: string;
}

interface Operator {
    id: number;
    codigo_operario: string;
    nombre_completo: string;
}

const SupervisorCreateTaskPage: React.FC<SupervisorCreateTaskPageProps> = ({ onBack, onLogout, onInitiateCreateTask, onChangePassword, currentUser, preselectedOrder }) => {
    const [equipmentOptions, setEquipmentOptions] = useState<MachineOption[]>([]);
    const [isLoadingEquipment, setIsLoadingEquipment] = useState(true);
    const [equipmentError, setEquipmentError] = useState<string | null>(null);

    const [productionOrders, setProductionOrders] = useState<ProductionOrderInfo[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [ordersError, setOrdersError] = useState<string | null>(null);

    const [operationOptions, setOperationOptions] = useState<Operation[]>([]);
    const [isLoadingOperations, setIsLoadingOperations] = useState(false);
    const [operationsError, setOperationsError] = useState<string | null>(null);

    const [operatorOptions, setOperatorOptions] = useState<Operator[]>([]);
    const [isLoadingOperators, setIsLoadingOperators] = useState(true);
    const [operatorsError, setOperatorsError] = useState<string | null>(null);


    useEffect(() => {
        const fetchMachines = async () => {
            setIsLoadingEquipment(true);
            setEquipmentError(null);
            try {
                // Fetch only active machines
                const response = await fetch('http://localhost:3001/api/machines?activeOnly=true');
                if (!response.ok) {
                    throw new Error('No se pudieron cargar los equipos.');
                }
                const data: MachineOption[] = await response.json();
                setEquipmentOptions(data);
            } catch (err) {
                 setEquipmentError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
            } finally {
                setIsLoadingEquipment(false);
            }
        };
        
        const fetchProductionOrders = async () => {
            setIsLoadingOrders(true);
            setOrdersError(null);
            try {
                const response = await fetch('http://localhost:3001/api/production-orders/selectable');
                 if (!response.ok) {
                    throw new Error('No se pudieron cargar las órdenes de producción.');
                }
                const data: ProductionOrderInfo[] = await response.json();
                setProductionOrders(data);
            } catch (err) {
                 setOrdersError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
            } finally {
                setIsLoadingOrders(false);
            }
        }

        const fetchOperators = async () => {
            setIsLoadingOperators(true);
            setOperatorsError(null);
            try {
                const response = await fetch('http://localhost:3001/api/users/operators');
                if (!response.ok) {
                    throw new Error('No se pudieron cargar los operarios.');
                }
                const data: Operator[] = await response.json();
                setOperatorOptions(data);
            } catch (err) {
                setOperatorsError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
            } finally {
                setIsLoadingOperators(false);
            }
        };

        fetchMachines();
        fetchProductionOrders();
        fetchOperators();
    }, []);
    
    const fetchOperations = async (productId: number | undefined) => {
        if (!productId) {
            setOperationOptions([]);
            setOperationsError(null);
            return;
        }
        setIsLoadingOperations(true);
        setOperationsError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/products/${productId}/operations`);
            if (!response.ok) {
                throw new Error('No se pudieron cargar las operaciones.');
            }
            const data: Operation[] = await response.json();
            setOperationOptions(data);
        } catch (err) {
             setOperationsError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
             setOperationOptions([]);
        } finally {
            setIsLoadingOperations(false);
        }
    };

    return (
        <div className="flex h-full min-h-screen flex-col bg-slate-100">
            <SupervisorSubPageHeader onBack={onBack} onLogout={onLogout} title="Crear Nueva Tarea" onChangePassword={onChangePassword} currentUser={currentUser} />
            <main className="flex-1 justify-center py-8 px-4 sm:px-6 md:px-10">
                <div className="max-w-2xl mx-auto">
                    <CreateTaskForm
                        onInitiateCreateTask={onInitiateCreateTask}
                        equipmentOptions={equipmentOptions}
                        isLoadingEquipment={isLoadingEquipment}
                        equipmentError={equipmentError}
                        productionOrders={productionOrders}
                        isLoadingOrders={isLoadingOrders}
                        ordersError={ordersError}
                        preselectedOrder={preselectedOrder}
                        operationOptions={operationOptions}
                        isLoadingOperations={isLoadingOperations}
                        operationsError={operationsError}
                        onFetchOperations={fetchOperations}
                        operatorOptions={operatorOptions}
                        isLoadingOperators={isLoadingOperators}
                        operatorsError={operatorsError}
                    />
                </div>
            </main>
        </div>
    );
};

export default SupervisorCreateTaskPage;