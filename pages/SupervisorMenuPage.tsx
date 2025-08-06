


import React from 'react';
import SupervisorHeader from '../components/SupervisorHeader';
import MenuOptionCard from '../components/MenuOptionCard';
import { UserInfo, AdminPage } from '../App';

interface SupervisorMenuPageProps {
  onLogout: () => void;
  onNavigate: (page: Extract<AdminPage, 'supervisorCreateTask' | 'supervisorTaskList' | 'supervisorUserManagement' | 'createProductionOrder' | 'productionOrderList' | 'machineManagement' | 'unproductiveCauseManagement'>) => void;
  onChangePassword: () => void;
  currentUser: UserInfo | null;
}

const SupervisorMenuPage: React.FC<SupervisorMenuPageProps> = ({ onLogout, onNavigate, onChangePassword, currentUser }) => {
  return (
    <div className="flex h-full min-h-screen flex-col bg-slate-100">
      <SupervisorHeader onLogout={onLogout} title="Panel del Supervisor" onChangePassword={onChangePassword} currentUser={currentUser} />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Panel de Control del Supervisor</h2>
                <p className="mt-2 text-lg text-slate-600">Seleccione una opción para comenzar.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <MenuOptionCard
              title="Crear Orden de Producción"
              description="Definir y programar nuevas órdenes de producción."
              icon="post_add"
              onClick={() => onNavigate('createProductionOrder')}
            />
            <MenuOptionCard
              title="Ver Órdenes de Producción"
              description="Revisar el estado de todas las órdenes y su progreso."
              icon="inventory_2"
              onClick={() => onNavigate('productionOrderList')}
            />
            <MenuOptionCard
              title="Crear Nueva Tarea"
              description="Asignar una nueva orden de fabricación a un operador."
              icon="add_circle_outline"
              onClick={() => onNavigate('supervisorCreateTask')}
            />
            <MenuOptionCard
              title="Resumen de Tareas"
              description="Ver el estado de todas las tareas activas y completadas."
              icon="list_alt"
              onClick={() => onNavigate('supervisorTaskList')}
            />
            <MenuOptionCard
              title="Gestionar Usuarios"
              description="Añadir, editar o eliminar cuentas de operario."
              icon="manage_accounts"
              onClick={() => onNavigate('supervisorUserManagement')}
            />
            <MenuOptionCard
              title="Consultar Máquinas"
              description="Ver el listado de máquinas y centros de trabajo."
              icon="precision_manufacturing"
              onClick={() => onNavigate('machineManagement')}
            />
             <MenuOptionCard
              title="Consultar Causas"
              description="Ver las causas de inactividad del sistema."
              icon="category"
              onClick={() => onNavigate('unproductiveCauseManagement')}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SupervisorMenuPage;
