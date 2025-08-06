
import React from 'react';
import SupervisorHeader from '../components/SupervisorHeader';
import MenuOptionCard from '../components/MenuOptionCard';
import { UserInfo, AdminPage } from '../App';

interface RootMenuPageProps {
  onLogout: () => void;
  onNavigate: (page: Extract<AdminPage, 'supervisorUserManagement' | 'unproductiveCauseManagement' | 'machineManagement'>) => void;
  onChangePassword: () => void;
  currentUser: UserInfo | null;
}

const RootMenuPage: React.FC<RootMenuPageProps> = ({ onLogout, onNavigate, onChangePassword, currentUser }) => {
  return (
    <div className="flex h-full min-h-screen flex-col bg-slate-100">
      <SupervisorHeader onLogout={onLogout} title="Panel de Control ROOT" onChangePassword={onChangePassword} currentUser={currentUser} />
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Bienvenido, Usuario ROOT</h2>
                <p className="mt-2 text-lg text-slate-600">Seleccione una opción para comenzar.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <MenuOptionCard
                  title="Gestionar Usuarios"
                  description="Control total sobre todas las cuentas del sistema."
                  icon="manage_accounts"
                  onClick={() => onNavigate('supervisorUserManagement')}
                />
                 <MenuOptionCard
                  title="Gestionar Causas"
                  description="Añadir, editar o eliminar categorías y causas de inactividad."
                  icon="category"
                  onClick={() => onNavigate('unproductiveCauseManagement')}
                />
                <MenuOptionCard
                  title="Gestionar Máquinas"
                  description="Añadir, editar o eliminar máquinas y centros de trabajo."
                  icon="precision_manufacturing"
                  onClick={() => onNavigate('machineManagement')}
                />
            </div>
        </div>
      </main>
    </div>
  );
};

export default RootMenuPage;