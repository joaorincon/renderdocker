



import React, { useState, useEffect } from 'react';
import { ProductionOrderInfo, NewTaskPayload } from '../App';
import { MachineOption } from '../pages/SupervisorCreateTaskPage';


interface Operation {
    id: number;
    nombre_operacion: string;
}

interface Operator {
    id: number;
    codigo_operario: string;
    nombre_completo: string;
}

interface CreateTaskFormProps {
    onInitiateCreateTask: (taskData: NewTaskPayload) => void;
    equipmentOptions: MachineOption[];
    isLoadingEquipment: boolean;
    equipmentError: string | null;
    productionOrders: ProductionOrderInfo[];
    isLoadingOrders: boolean;
    ordersError: string | null;
    preselectedOrder: ProductionOrderInfo | null;
    operationOptions: Operation[];
    isLoadingOperations: boolean;
    operationsError: string | null;
    onFetchOperations: (productId: number | undefined) => void;
    operatorOptions: Operator[];
    isLoadingOperators: boolean;
    operatorsError: string | null;
}


const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string}> = ({label, id, ...props}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <input 
            id={id}
            {...props}
            className="form-input block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
        />
    </div>
);

const FormSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & {label: string, children: React.ReactNode}> = ({label, id, children, ...props}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <select
            id={id}
            {...props}
            className="form-select block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
        >
            {children}
        </select>
    </div>
);

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({ 
    onInitiateCreateTask, 
    equipmentOptions, isLoadingEquipment, equipmentError,
    productionOrders, isLoadingOrders, ordersError, preselectedOrder,
    operationOptions, isLoadingOperations, operationsError, onFetchOperations,
    operatorOptions, isLoadingOperators, operatorsError
}) => {
    const [op, setOp] = useState('');
    const [equipment, setEquipment] = useState('');
    const [operator, setOperator] = useState('');
    const [productionOrderNumber, setProductionOrderNumber] = useState<string>('');

    useEffect(() => {
        let initialOrderNumber = '';
        if (preselectedOrder) {
            initialOrderNumber = preselectedOrder.orden_numero;
        } else if (productionOrders.length > 0) {
            initialOrderNumber = productionOrders[0].orden_numero;
        }
        setProductionOrderNumber(initialOrderNumber);

        const allOrders = preselectedOrder ? [preselectedOrder, ...productionOrders] : productionOrders;
        const initialOrder = allOrders.find(o => o.orden_numero === initialOrderNumber);
        
        onFetchOperations(initialOrder?.product_id);
    }, [preselectedOrder, productionOrders]);
    
    useEffect(() => {
        if (equipmentOptions.length > 0 && !equipment) {
            setEquipment(String(equipmentOptions[0].id));
        }
    }, [equipmentOptions, equipment]);

    useEffect(() => {
        if (operatorOptions.length > 0 && !operator) {
            setOperator(operatorOptions[0].codigo_operario);
        }
    }, [operatorOptions, operator]);

    useEffect(() => {
        // Set default operation when options change
        if (operationOptions.length > 0) {
            setOp(operationOptions[0].nombre_operacion);
        } else {
            setOp('');
        }
    }, [operationOptions]);

    const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newOrderNumber = e.target.value;
        setProductionOrderNumber(newOrderNumber);
        const selectedOrder = productionOrders.find(o => o.orden_numero === newOrderNumber);
        onFetchOperations(selectedOrder?.product_id);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalOrder = preselectedOrder || productionOrders.find(o => o.orden_numero === productionOrderNumber);
        if (!finalOrder) {
            alert('Por favor, seleccione una orden de producción válida.');
            return;
        }
        
        const selectedOperator = operatorOptions.find(o => o.codigo_operario === operator);
        if (!selectedOperator) {
             alert('Por favor, seleccione un operador válido.');
            return;
        }

        const selectedOperation = operationOptions.find(o => o.nombre_operacion === op);
        if (!selectedOperation) {
            alert('Por favor, seleccione una operación válida.');
            return;
        }

        const selectedEquipment = equipmentOptions.find(eq => eq.id === parseInt(equipment));
        if (!selectedEquipment) {
            alert('Por favor, seleccione un equipo válido.');
            return;
        }

        onInitiateCreateTask({
            partRef: finalOrder.product_name,
            op: selectedOperation.nombre_operacion,
            equipment: selectedEquipment.nombre,
            qty: finalOrder.cantidad_requerida,
            operator: selectedOperator.nombre_completo,
            productionOrderNumber: finalOrder.orden_numero,
            // IDs for backend
            order_id: finalOrder.id,
            user_id: selectedOperator.id,
            work_center_id: selectedEquipment.id,
            product_operation_id: selectedOperation.id,
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Crear Nueva Tarea</h2>
            <p className="text-sm text-slate-500 mb-6">Complete los detalles para crear una nueva orden de fabricación.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormSelect
                    label="Orden de Producción Asociada"
                    id="productionOrder"
                    name="productionOrder"
                    value={productionOrderNumber}
                    onChange={handleOrderChange}
                    disabled={!!preselectedOrder || isLoadingOrders || !!ordersError || productionOrders.length === 0}
                    required
                >
                    {isLoadingOrders ? (
                        <option>Cargando órdenes...</option>
                    ) : ordersError ? (
                        <option>Error al cargar</option>
                    ) : productionOrders.length === 0 ? (
                        <option value="">No hay órdenes programadas</option>
                    ) : (
                        productionOrders.map(order => 
                            <option key={order.id} value={order.orden_numero}>
                                {`${order.orden_numero} (${order.product_name}, Cant: ${order.cantidad_requerida})`}
                            </option>
                        )
                    )}
                </FormSelect>
                <FormSelect
                    label="Operación"
                    id="op"
                    name="op"
                    value={op}
                    onChange={(e) => setOp(e.target.value)}
                    required
                    disabled={isLoadingOperations || !!operationsError || operationOptions.length === 0}
                >
                   {isLoadingOperations ? (
                        <option>Cargando operaciones...</option>
                    ) : operationsError ? (
                        <option>Error al cargar</option>
                    ) : operationOptions.length === 0 ? (
                        <option value="">No hay operaciones para este producto</option>
                    ) : (
                        operationOptions.map(option => <option key={option.id} value={option.nombre_operacion}>{option.nombre_operacion}</option>)
                    )}
                </FormSelect>
                 <FormSelect
                    label="Equipo"
                    id="equipment"
                    name="equipment"
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    required
                    disabled={isLoadingEquipment || !!equipmentError || equipmentOptions.length === 0}
                >
                    {isLoadingEquipment ? (
                       <option>Cargando equipos...</option> 
                    ) : equipmentError ? (
                        <option>Error al cargar</option>
                    ) : equipmentOptions.length === 0 ? (
                        <option value="">No hay equipos activos</option>
                    ) : (
                        equipmentOptions.map(option => <option key={option.id} value={option.id}>{option.nombre}</option>)
                    )}
                </FormSelect>
                <FormSelect
                    label="Operador"
                    id="operator"
                    name="operator"
                    value={operator}
                    onChange={(e) => setOperator(e.target.value)}
                    required
                    disabled={isLoadingOperators || !!operatorsError || operatorOptions.length === 0}
                >
                    {isLoadingOperators ? (
                       <option>Cargando operarios...</option> 
                    ) : operatorsError ? (
                        <option>Error al cargar</option>
                    ) : operatorOptions.length === 0 ? (
                        <option value="">No hay operarios activos</option>
                    ) : (
                        operatorOptions.map(option => <option key={option.id} value={option.codigo_operario}>
                            {`${option.codigo_operario} - ${option.nombre_completo}`}
                        </option>)
                    )}
                </FormSelect>
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoadingOrders || isLoadingEquipment || isLoadingOperations || isLoadingOperators}
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                         <span className="material-icons text-lg">add_circle_outline</span>
                        Crear Tarea
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateTaskForm;