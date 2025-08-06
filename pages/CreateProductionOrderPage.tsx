
import React, { useState, useEffect } from 'react';
import SupervisorSubPageHeader from '../components/SupervisorSubPageHeader';
import CreateProductionOrderForm from '../components/CreateProductionOrderForm';
import { UserInfo } from '../App';

interface CreateProductionOrderPageProps {
    onBack: () => void;
    onLogout: () => void;
    onChangePassword: () => void;
    currentUser: UserInfo | null;
    onInitiateCreateOrder: (data: {
        orden_numero: string;
        product_id: number;
        product_name: string;
        cantidad_requerida: number;
        fecha_inicio_programada: string;
    }) => void;
    isSubmitting: boolean;
}

export interface Product {
    id: number;
    nombre: string;
}

const CreateProductionOrderPage: React.FC<CreateProductionOrderPageProps> = ({ onBack, onLogout, onChangePassword, currentUser, onInitiateCreateOrder, isSubmitting }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:3001/api/products');
                if (!response.ok) {
                    throw new Error('No se pudieron cargar los productos.');
                }
                const data: Product[] = await response.json();
                setProducts(data);
            } catch (err) {
                 setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="flex h-full min-h-screen flex-col bg-slate-100">
            <SupervisorSubPageHeader onBack={onBack} onLogout={onLogout} title="Crear Orden de Producción" onChangePassword={onChangePassword} currentUser={currentUser} />
            <main className="flex-1 justify-center py-8 px-4 sm:px-6 md:px-10">
                <div className="max-w-2xl mx-auto">
                    <CreateProductionOrderForm
                        onInitiateCreateOrder={onInitiateCreateOrder}
                        products={products}
                        isLoadingProducts={isLoading}
                        productsError={error}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </main>
        </div>
    );
};

export default CreateProductionOrderPage;
