import React, { useState, useEffect } from 'react';
import SupervisorSubPageHeader from '../components/SupervisorSubPageHeader';
import CreateUserModal, { NewUserData } from '../components/CreateUserModal';
import EditUserModal, { UserDataToUpdate } from '../components/EditUserModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import { UserRole, UserInfo } from '../App';


interface SupervisorUserManagementPageProps {
  onBack: () => void;
  onLogout: () => void;
  userRole: UserRole | null;
  currentUser: UserInfo | null;
  onChangePassword: () => void;
}

interface User {
    id: number;
    nombre_completo: string;
    codigo_operario: string;
    nombre_rol: string;
    is_active: boolean;
}

const SupervisorUserManagementPage: React.FC<SupervisorUserManagementPageProps> = ({ onBack, onLogout, userRole, currentUser, onChangePassword }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    
    const canManageUsers = userRole === 'root' || userRole === 'admin_planta';

    const usersToDisplay = users.filter(user => {
        // Normalize role from DB (e.g., "Admin Planta" -> "admin_planta") to compare with UserRole type
        const normalizedTargetRole = user.nombre_rol.toLowerCase().replace(/\s+/g, '_');

        if (userRole === 'admin_planta') {
            return normalizedTargetRole !== 'root';
        }

        if (userRole === 'supervisor' || userRole === 'analista') {
            // Use normalized role for case-insensitive and consistent comparison
            return ['operario', 'supervisor'].includes(normalizedTargetRole);
        }

        // 'root' and any other case will see all users
        return true;
    });


    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3001/api/users');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar los usuarios.');
            }
            const data: User[] = await response.json();
            setUsers(data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocurrió un error inesperado.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (newUserData: NewUserData) => {
        try {
            const response = await fetch('http://localhost:3001/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUserData),
            });
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al crear el usuario.');
            }

            setUsers(prevUsers => [...prevUsers, data].sort((a,b) => {
                if (a.is_active !== b.is_active) {
                    return a.is_active ? -1 : 1;
                }
                return a.nombre_completo.localeCompare(b.nombre_completo);
            }));
            setIsCreateModalOpen(false);
            return Promise.resolve();
        } catch (err) {
            if (err instanceof Error) {
                return Promise.reject(err);
            }
            return Promise.reject(new Error('Ocurrió un error inesperado.'));
        }
    };

    const handleUpdateUser = async (userId: number, userData: UserDataToUpdate): Promise<void> => {
        if (!currentUser) {
            return Promise.reject(new Error('No hay un usuario conectado para realizar la acción.'));
        }
        try {
            const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...userData, updated_by_id: currentUser.id }),
            });
            const updatedUser = await response.json();
            if (!response.ok) {
                throw new Error(updatedUser.message || 'Error al actualizar el usuario.');
            }

            setUsers(prevUsers => 
                prevUsers
                    .map(u => u.id === userId ? updatedUser : u)
                    .sort((a, b) => {
                        if (a.is_active !== b.is_active) {
                            return a.is_active ? -1 : 1;
                        }
                        return a.nombre_completo.localeCompare(b.nombre_completo);
                    })
            );

            setUserToEdit(null);
            return Promise.resolve();
        } catch (err) {
            if (err instanceof Error) {
                return Promise.reject(err);
            }
            return Promise.reject(new Error('Ocurrió un error inesperado.'));
        }
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete || !currentUser) return;

        setIsDeleting(true);
        setDeleteError(null);
        try {
            const response = await fetch(`http://localhost:3001/api/users/${userToDelete.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deleted_by_id: currentUser.id })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al eliminar el usuario.');
            }

            setUsers(prevUsers => prevUsers.filter(u => u.id !== userToDelete.id));
            setUserToDelete(null);
        } catch (err) {
            if (err instanceof Error) {
                setDeleteError(err.message);
            } else {
                setDeleteError('Ocurrió un error inesperado.');
            }
        } finally {
            setIsDeleting(false);
        }
    };


    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-8 text-slate-600">Cargando usuarios...</div>;
        }

        if (error) {
            return (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            );
        }
        
        if(usersToDisplay.length === 0 && !isLoading) {
            return <div className="text-center p-8 text-slate-600">No se encontraron usuarios para mostrar.</div>;
        }

        return (
            <div className="overflow-x-auto relative">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nombre Completo</th>
                            <th scope="col" className="px-6 py-3">Código de Operario</th>
                            <th scope="col" className="px-6 py-3">Rol</th>
                            <th scope="col" className="px-6 py-3">Estado</th>
                            {canManageUsers && <th scope="col" className="px-6 py-3 text-right">Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {usersToDisplay.map(user => {
                            const normalizedTargetRole = user.nombre_rol.toLowerCase().replace(/\s+/g, '_');
                            const isSelf = currentUser?.codigo_operario === user.codigo_operario;

                            let canEdit = false;
                            let canDelete = false;

                            if (userRole === 'root') {
                                canEdit = true;
                                canDelete = normalizedTargetRole !== 'root';
                            } else if (userRole === 'admin_planta') {
                                if (normalizedTargetRole === 'admin_planta') {
                                    canEdit = isSelf;
                                    canDelete = false;
                                } else if (normalizedTargetRole !== 'root') {
                                    canEdit = true;
                                    canDelete = true;
                                }
                            }

                            return (
                                <tr key={user.id} className="bg-white border-b hover:bg-slate-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{user.nombre_completo}</th>
                                    <td className="px-6 py-4">{user.codigo_operario}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${user.nombre_rol.toLowerCase() === 'supervisor' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}`}>
                                            {user.nombre_rol}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {user.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    {canManageUsers && (
                                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                            {canEdit && <button onClick={() => setUserToEdit(user)} className="font-medium text-blue-600 hover:underline">Editar</button>}
                                            {canDelete && <button onClick={() => setUserToDelete(user)} className="font-medium text-red-600 hover:underline">Eliminar</button>}
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

  return (
    <>
        <div className="flex h-full min-h-screen flex-col bg-slate-100">
          <SupervisorSubPageHeader onBack={onBack} onLogout={onLogout} title="Gestionar Usuarios" onChangePassword={onChangePassword} currentUser={currentUser} />
          <main className="flex-1 justify-center py-8 px-4 sm:px-6 md:px-10">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900">Lista de Usuarios del Sistema</h2>
                        {canManageUsers && (
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center justify-center gap-2 rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                                <span className="material-icons text-lg">add</span>
                                Crear Usuario
                            </button>
                        )}
                    </div>
                    {renderContent()}
                </div>
            </div>
          </main>
        </div>
        <CreateUserModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCreateUser={handleCreateUser}
        />
        <EditUserModal
            isOpen={!!userToEdit}
            onClose={() => setUserToEdit(null)}
            onSave={handleUpdateUser}
            user={userToEdit}
            currentUserRole={userRole}
            currentUser={currentUser}
        />
        <DeleteConfirmationModal
            isOpen={!!userToDelete}
            onClose={() => {
                setUserToDelete(null);
                setDeleteError(null);
            }}
            onConfirm={handleConfirmDelete}
            userName={userToDelete?.nombre_completo || ''}
            isLoading={isDeleting}
            error={deleteError}
        />
    </>
  );
};

export default SupervisorUserManagementPage;