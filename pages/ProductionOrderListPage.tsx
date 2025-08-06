import React, { useState, useEffect, useMemo } from 'react';
import SupervisorSubPageHeader from '../components/SupervisorSubPageHeader';
import { UserInfo } from '../App';

// Data structure for a production order
interface ProductionOrder {
    id: number;
    orden_numero: string;
    product_name: string;
    cantidad_requerida: number;
    fecha_inicio_programada: string;
    estado: 'Programada' | 'En Proceso' | 'Finalizada';
    created_by: string;
    created_at: string;
}

// Props for the page component
interface ProductionOrderListPageProps {
    onBack: () => void;
    onLogout: () => void;
    currentUser: UserInfo | null;
    onChangePassword: () => void;
}

// Status badge styles
const statusStyles: Record<ProductionOrder['estado'], string> = {
    'Programada': 'bg-blue-100 text-blue-800 border-blue-300',
    'En Proceso': 'bg-sky-100 text-sky-800 border-sky-300',
    'Finalizada': 'bg-green-100 text-green-800 border-green-300',
};

const ProductionOrderListPage: React.FC<ProductionOrderListPageProps> = ({ onBack, onLogout, currentUser, onChangePassword }) => {
    const [orders, setOrders] = useState<ProductionOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | ProductionOrder['estado']>('All');

    // Fetch data on component mount
    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:3001/api/production-orders');
                if (!response.ok) {
                    throw new Error('No se pudieron cargar las órdenes de producción.');
                }
                const data: ProductionOrder[] = await response.json();
                setOrders(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Memoized filtering and searching
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesStatus = statusFilter === 'All' || order.estado === statusFilter;
            const matchesSearch = searchTerm.trim() === '' ||
                order.orden_numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.product_name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesSearch;
        });
    }, [orders, searchTerm, statusFilter]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-10 text-slate-500">Cargando órdenes...</div>;
        }
        if (error) {
            return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg m-6" role="alert">{error}</div>;
        }
        if (filteredOrders.length === 0 && !isLoading) {
            return <div className="text-center p-10 text-slate-500">No se encontraron órdenes que coincidan con los filtros.</div>;
        }
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-4 py-3">Nº Orden</th>
                            <th scope="col" className="px-4 py-3">Producto</th>
                            <th scope="col" className="px-4 py-3">Cantidad</th>
                            <th scope="col" className="px-4 py-3">F. Programada</th>
                            <th scope="col" className="px-4 py-3">Estado</th>
                            <th scope="col" className="px-4 py-3">Creado por</th>
                            <th scope="col" className="px-4 py-3">F. Creación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                            <tr key={order.id} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-4 py-4 font-semibold text-slate-800">{order.orden_numero}</td>
                                <td className="px-4 py-4">{order.product_name}</td>
                                <td className="px-4 py-4 font-medium">{order.cantidad_requerida}</td>
                                <td className="px-4 py-4">{new Date(order.fecha_inicio_programada).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' })}</td>
                                <td className="px-4 py-4">
                                    <span className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full border ${statusStyles[order.estado]}`}>
                                        {order.estado}
                                    </span>
                                </td>
                                <td className="px-4 py-4">{order.created_by}</td>
                                <td className="px-4 py-4 text-slate-600">{formatDate(order.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="flex h-full min-h-screen flex-col bg-slate-100">
            <SupervisorSubPageHeader onBack={onBack} onLogout={onLogout} title="Lista de Órdenes de Producción" onChangePassword={onChangePassword} currentUser={currentUser} />
            <main className="flex-1 justify-center py-8 px-4 sm:px-6 md:px-10">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="relative w-full md:w-80">
                                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                    <input
                                        type="text"
                                        placeholder="Buscar por Nº Orden o producto..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="form-input block w-full appearance-none rounded-md border border-slate-300 bg-white pl-10 pr-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                                    />
                                </div>
                                <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
                                    {(['All', 'Programada', 'En Proceso', 'Finalizada'] as const).map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${statusFilter === status ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}
                                        >
                                            {status === 'All' ? 'Todas' : status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProductionOrderListPage;