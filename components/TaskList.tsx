import React from 'react';
import { TaskData } from '../pages/ProductionTrackerPage';
import { UserRole } from '../App';

const statusStyles = {
  Pending: 'bg-yellow-100 text-yellow-800',
  'In Progress': 'bg-sky-100 text-sky-800',
  'Unproductive Cause in Progress': 'bg-orange-100 text-orange-800',
  'Completed': 'bg-green-100 text-green-800',
};

interface StatusBadgeProps {
  status: TaskData['status'];
  statusOptions: Record<string, string>;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, statusOptions }) => {
    const statusText = statusOptions[status] || 'Desconocido';
    return (
        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${statusStyles[status]}`}>
            <span className="w-2 h-2 mr-1.5 rounded-full" style={{backgroundColor: 'currentColor'}}></span>
            {statusText}
        </span>
    );
};

interface TaskListProps {
    tasks: TaskData[];
    userRole: UserRole | null;
    onExport: () => void;
    operatorFilter: string;
    onOperatorFilterChange: (value: string) => void;
    statusFilter: string;
    onStatusFilterChange: (value: string) => void;
    statusOptions: Record<string, string>;
}

const TaskList: React.FC<TaskListProps> = ({
    tasks,
    userRole,
    onExport,
    operatorFilter,
    onOperatorFilterChange,
    statusFilter,
    onStatusFilterChange,
    statusOptions
}) => {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-slate-900 shrink-0">Resumen de Todas las Tareas</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                         <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                         <input 
                            type="text"
                            placeholder="Filtrar por operador..."
                            value={operatorFilter}
                            onChange={(e) => onOperatorFilterChange(e.target.value)}
                            className="form-input block w-full appearance-none rounded-md border border-slate-300 bg-white pl-10 pr-3 py-2 text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                         />
                    </div>
                     <select
                        value={statusFilter}
                        onChange={(e) => onStatusFilterChange(e.target.value)}
                        className="form-select block w-full sm:w-56 appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm transition-colors"
                    >
                        {Object.entries(statusOptions).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                     {userRole === 'analista' && (
                        <button
                            onClick={onExport}
                            className="flex items-center justify-center gap-2 h-10 px-4 rounded-md border border-transparent bg-green-600 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
                        >
                            <span className="material-icons text-lg">download</span>
                            Exportar CSV
                        </button>
                    )}
                </div>
            </div>
            <div className="overflow-x-auto relative">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">ID Tarea</th>
                            <th scope="col" className="px-6 py-3">Orden Prod.</th>
                            <th scope="col" className="px-6 py-3">Ref. Parte</th>
                            <th scope="col" className="px-6 py-3">Operador</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                            <th scope="col" className="px-6 py-3">Cant.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...tasks].reverse().map(task => (
                            <tr key={task.id} className="bg-white border-b hover:bg-slate-50">
                                <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{task.id}</th>
                                <td className="px-6 py-4 font-medium text-blue-600">{task.productionOrderNumber || '-'}</td>
                                <td className="px-6 py-4">{task.partRef}</td>
                                <td className="px-6 py-4">{task.operator || 'N/A'}</td>
                                <td className="px-6 py-4"><StatusBadge status={task.status} statusOptions={statusOptions} /></td>
                                <td className="px-6 py-4">{task.qty}</td>
                            </tr>
                        ))}
                         {tasks.length === 0 && (
                            <tr className="bg-white border-b">
                                <td colSpan={6} className="text-center px-6 py-8 text-slate-500">
                                    No se encontraron tareas que coincidan con los filtros.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TaskList;