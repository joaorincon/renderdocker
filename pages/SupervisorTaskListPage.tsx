import React, { useState, useMemo } from 'react';
import SupervisorSubPageHeader from '../components/SupervisorSubPageHeader';
import TaskList from '../components/TaskList';
import { TaskData } from './ProductionTrackerPage';
import { UserInfo } from '../App';

interface SupervisorTaskListPageProps {
  tasks: TaskData[];
  onBack: () => void;
  onLogout: () => void;
  onChangePassword: () => void;
  currentUser: UserInfo | null;
}

const statusOptions: { [key in TaskData['status'] | 'All']: string } = {
    'All': 'Todos los Estados',
    'Pending': 'Pendiente',
    'In Progress': 'En Progreso',
    'Unproductive Cause in Progress': 'Causa Improductiva',
    'Completed': 'Completada',
};

const formatDuration = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) {
        return '00:00:00';
    }
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

const SupervisorTaskListPage: React.FC<SupervisorTaskListPageProps> = ({ tasks, onBack, onLogout, onChangePassword, currentUser }) => {
  const [operatorFilter, setOperatorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<keyof typeof statusOptions>('All');

  const filteredTasks = useMemo(() => {
      return tasks.filter(task => {
          const operatorMatch = operatorFilter.trim() === '' || task.operator?.toLowerCase().includes(operatorFilter.trim().toLowerCase());
          const statusMatch = statusFilter === 'All' || task.status === statusFilter;
          return operatorMatch && statusMatch;
      });
  }, [tasks, operatorFilter, statusFilter]);

  const handleExportCSV = () => {
    const headers = [
        "ID Tarea", "Estado", "Ref. Parte", "Operación", "Equipo", "Cantidad", "Operador",
        "Tiempo Productivo Total (HH:MM:SS)", "Tiempo Improductivo Total (HH:MM:SS)", "Detalle Eventos Improductivos"
    ];

    const escapeCSV = (field: any): string => {
        const str = String(field ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
             return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const csvContent = [
        headers.join(','),
        ...filteredTasks.map(task => {
            const unproductiveDuration = task.unproductiveEvents.reduce((acc, event) => acc + (event.duration || 0), 0);
            const unproductiveDetails = task.unproductiveEvents
                .filter(e => e.duration > 0)
                .map(e => `${e.cause} (${formatDuration(e.duration)})`)
                .join('; ');
            
            const row = [
                task.id,
                statusOptions[task.status] || task.status,
                task.partRef,
                task.op,
                task.equipment,
                task.qty,
                task.operator || 'N/A',
                formatDuration(task.totalElapsedTime),
                formatDuration(unproductiveDuration),
                unproductiveDetails
            ].map(escapeCSV);

            return row.join(',');
        })
    ].join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `resumen_tareas_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as keyof typeof statusOptions);
  };

  return (
    <div className="flex h-full min-h-screen flex-col bg-slate-100">
      <SupervisorSubPageHeader onBack={onBack} onLogout={onLogout} title="Resumen de Tareas" onChangePassword={onChangePassword} currentUser={currentUser} />
      <main className="flex-1 justify-center py-8 px-4 sm:px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
            <TaskList
              tasks={filteredTasks}
              userRole={currentUser?.role || null}
              onExport={handleExportCSV}
              operatorFilter={operatorFilter}
              onOperatorFilterChange={setOperatorFilter}
              statusFilter={statusFilter}
              onStatusFilterChange={handleStatusFilterChange}
              statusOptions={statusOptions}
            />
        </div>
      </main>
    </div>
  );
};

export default SupervisorTaskListPage;