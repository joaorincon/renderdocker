
import React, { useState, useEffect } from 'react';
import { Product } from '../pages/CreateProductionOrderPage';

export interface ProductionOrderData {
    id: number;
    orden_numero: string;
    product_id: number;
    cantidad_requerida: number;
    fecha_inicio_programada: string; // YYYY-MM-DD
    estado: string;
    created_by_id: number;
    created_at: string;
}

interface CreateProductionOrderFormProps {
    onInitiateCreateOrder: (data: {
        orden_numero: string;
        product_id: number;
        product_name: string;
        cantidad_requerida: number;
        fecha_inicio_programada: string;
    }) => void;
    products: Product[];
    isLoadingProducts: boolean;
    productsError: string | null;
    isSubmitting: boolean;
}

const FormInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {label: string}> = ({label, id, ...props}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
        <input 
            id={id}
            {...props}
            className="form-input block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors disabled:bg-slate-100"
        />
    </div>
);


const CreateProductionOrderForm: React.FC<CreateProductionOrderFormProps> = ({ onInitiateCreateOrder, products, isLoadingProducts, productsError, isSubmitting }) => {
    const [orderNumber, setOrderNumber] = useState('');
    const [productId, setProductId] = useState<number | ''>('');
    const [quantity, setQuantity] = useState('');
    const [scheduleDate, setScheduleDate] = useState('');
    
    const [formError, setFormError] = useState<string|null>(null);

    useEffect(() => {
        // Set default product when options load
        if (products.length > 0 && !productId) {
            setProductId(products[0].id);
        }
    }, [products, productId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        
        if (!orderNumber || !productId || !quantity || !scheduleDate) {
            setFormError('Por favor, complete todos los campos.');
            return;
        }

        const selectedProduct = products.find(p => p.id === Number(productId));
        if (!selectedProduct) {
            setFormError('El producto seleccionado no es válido. Por favor, recargue la página.');
            return;
        }

        onInitiateCreateOrder({
            orden_numero: orderNumber,
            product_id: Number(productId),
            product_name: selectedProduct.nombre,
            cantidad_requerida: parseInt(quantity, 10),
            fecha_inicio_programada: scheduleDate,
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Nueva Orden de Producción</h2>
            <p className="text-sm text-slate-500 mb-6">Complete los detalles para programar una nueva orden.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                    label="Número de Orden"
                    id="orderNumber"
                    name="orderNumber"
                    type="text"
                    placeholder="Ej: OP-2025-001"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    required
                    disabled={isSubmitting}
                />
                <div>
                    <label htmlFor="product" className="block text-sm font-medium text-slate-700 mb-1.5">Producto</label>
                    <select
                        id="product"
                        name="product"
                        value={productId}
                        onChange={(e) => setProductId(Number(e.target.value))}
                        required
                        disabled={isSubmitting || isLoadingProducts || !!productsError || products.length === 0}
                        className="form-select block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed"
                    >
                        {isLoadingProducts ? (
                           <option>Cargando productos...</option> 
                        ) : productsError ? (
                            <option>Error al cargar</option>
                        ) : products.length === 0 ? (
                            <option>No hay productos activos</option>
                        ) : (
                            products.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)
                        )}
                    </select>
                    {productsError && <p className="text-xs text-red-600 mt-1">{productsError}</p>}
                </div>
                <FormInput
                    label="Cantidad Requerida"
                    id="quantity"
                    name="quantity"
                    type="number"
                    placeholder="Ej: 1000"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    disabled={isSubmitting}
                    min="1"
                />
                <FormInput
                    label="Fecha de Programación"
                    id="scheduleDate"
                    name="scheduleDate"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    required
                    disabled={isSubmitting}
                    min={new Date().toISOString().split("T")[0]} // Today as minimum date
                />

                {formError && (
                    <div className="rounded-md bg-red-50 p-3">
                        <p className="text-sm font-medium text-red-800">{formError}</p>
                    </div>
                )}
                
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting || isLoadingProducts}
                        className="flex w-full items-center justify-center gap-2 rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                         <span className="material-icons text-lg">save</span>
                        {isSubmitting ? 'Procesando...' : 'Guardar Orden de Producción'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProductionOrderForm;
