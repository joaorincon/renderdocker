

import React from 'react';
import SupervisorHeader from '../components/SupervisorHeader';
import MenuOptionCard from '../components/MenuOptionCard';
import { UserInfo, AdminPage } from '../App';

interface AnalistaMenuPageProps {
  onLogout: () => void;
  onNavigate: (page: Extract<AdminPage, 'supervisorTaskList' | 'supervisorUserManagement' | 'unproductiveCauseManagement' | 'productionOrderList' | 'machineManagement'>) => void;
  onChangePassword: () => void;
  currentUser: UserInfo | null;
}

const AnalistaMenuPage: React.FC<AnalistaMenuPageProps> = ({ onLogout, onNavigate, onChangePassword, currentUser }) => {
  return (
    <div className="flex h-full min-h-screen flex-col bg-slate-100">
      <SupervisorHeader onLogout={onLogout} title="Panel del Analista" onChangePassword={onChangePassword} currentUser={currentUser} />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-5xl mx-auto">
           <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Bienvenido, Analista</h2>
                <p className="mt-2 text-lg text-slate-600">Seleccione una opción para comenzar.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <MenuOptionCard
                  title="Resumen de Tareas"
                  description="Ver el estado de todas las tareas activas y completadas."
                  icon="list_alt"
                  onClick={() => onNavigate('supervisorTaskList')}
                />
                <MenuOptionCard
                  title="Consultar Usuarios"
                  description="Visualizar la lista de operarios y supervisores."
                  icon="manage_accounts"
                  onClick={() => onNavigate('supervisorUserManagement')}
                />
                <MenuOptionCard
                  title="Consultar Causas"
                  description="Ver las causas de inactividad del sistema."
                  icon="category"
                  onClick={() => onNavigate('unproductiveCauseManagement')}
                />
                 <MenuOptionCard
                  title="Consultar Órdenes"
                  description="Visualizar el listado de órdenes de producción."
                  icon="inventory_2"
                  onClick={() => onNavigate('productionOrderList')}
                />
                <MenuOptionCard
                  title="Consultar Máquinas"
                  description="Visualizar el listado de máquinas y centros de trabajo."
                  icon="precision_manufacturing"
                  onClick={() => onNavigate('machineManagement')}
                />
            </div>
        </div>
      </main>
    </div>
  );
};

export default AnalistaMenuPage;