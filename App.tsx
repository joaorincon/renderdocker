

import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import ProductionTrackerPage, { TaskData, UnproductiveEvent } from './pages/ProductionTrackerPage';
import TaskDetailsPage from './pages/TaskDetailsPage';
import UnproductiveCausePage from './pages/UnproductiveCausePage';
import FinishTaskPage from './pages/FinishTaskPage';
import SupervisorMenuPage from './pages/SupervisorMenuPage';
import SupervisorCreateTaskPage from './pages/SupervisorCreateTaskPage';
import SupervisorTaskListPage from './pages/SupervisorTaskListPage';
import SupervisorUserManagementPage from './pages/SupervisorUserManagementPage';
import ConfirmationModal from './components/ConfirmationModal';
import RootMenuPage from './pages/RootMenuPage';
import AdminPlantaMenuPage from './pages/AdminPlantaMenuPage';
import AnalistaMenuPage from './pages/AnalistaMenuPage';
import ChangePasswordModal from './components/ChangePasswordModal';
import UnproductiveCauseManagementPage from './pages/UnproductiveCauseManagementPage';
import MachineManagementPage from './pages/MachineManagementPage';
import CreateProductionOrderPage from './pages/CreateProductionOrderPage';
import ProductionOrderListPage from './pages/ProductionOrderListPage';
import { ProductionOrderData } from './components/CreateProductionOrderForm';

export interface NewTaskPayload extends Omit<TaskData, 'id' | 'db_id' | 'status' | 'startTime' | 'totalElapsedTime' | 'unproductiveEvents' | 'imageUrl'> {
    order_id: number;
    user_id: number;
    work_center_id: number;
    product_operation_id: number;
}


export type UserRole = 'operario' | 'supervisor' | 'root' | 'admin_planta' | 'analista';

export interface UserInfo {
    id: number;
    codigo_operario: string;
    role: UserRole;
}

export interface ProductionOrderInfo {
    id: number;
    product_id: number;
    orden_numero: string;
    product_name: string;
    cantidad_requerida: number;
}

interface ConfirmationModalConfig {
    title: string;
    message: React.ReactNode;
    confirmButtonText: string;
    confirmButtonClass: string;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
    cancelButtonText?: string;
    icon?: string;
    iconClass?: string;
}

export type AdminPage = 'supervisorCreateTask' | 'supervisorTaskList' | 'supervisorUserManagement' | 'unproductiveCauseManagement' | 'machineManagement' | 'createProductionOrder' | 'productionOrderList';
type View = 'login' | 'tracker' | 'taskDetail' | 'unproductive' | 'finishTask' | 'supervisorMenu' | 'rootMenu' | 'adminPlantaMenu' | 'analistaMenu' | AdminPage;


const App: React.FC = () => {
  const [view, setView] = useState<View>('login');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [previousView, setPreviousView] = useState<'tracker' | 'taskDetail' | null>(null);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [confirmationModalConfig, setConfirmationModalConfig] = useState<ConfirmationModalConfig | null>(null);
  const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [orderForNewTask, setOrderForNewTask] = useState<ProductionOrderInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fetchTasks = async () => {
    // Can add loading state if desired
    try {
        const response = await fetch('http://localhost:3001/api/tasks');
        if (!response.ok) {
            throw new Error('No se pudieron cargar las tareas.');
        }
        const data: TaskData[] = await response.json();
        setTasks(data);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        // Handle error in UI, e.g. show a toast
    }
  };

  useEffect(() => {
      // Fetch tasks when a user logs in
      if (currentUser) {
          fetchTasks();
      }
  }, [currentUser]);


  useEffect(() => {
    if (selectedTask) {
      const freshTask = tasks.find(t => t.id === selectedTask.id);
      if (freshTask && JSON.stringify(freshTask) !== JSON.stringify(selectedTask)) {
        setSelectedTask(freshTask);
      } else if (!freshTask) {
        setSelectedTask(null);
      }
    }
  }, [tasks, selectedTask]);

  const handleLogin = async (username: string, pin: string) => {
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ codigo_operario: username, pin }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el inicio de sesión');
      }
      
      const userInfo: UserInfo = {
          id: data.user.id,
          codigo_operario: data.user.codigo_operario,
          role: data.user.role,
      };
      setUserRole(userInfo.role);
      setCurrentUser(userInfo);
      
      switch (userInfo.role) {
        case 'operario':
          setView('tracker');
          break;
        case 'supervisor':
          setView('supervisorMenu');
          break;
        case 'root':
          setView('rootMenu');
          break;
        case 'admin_planta':
          setView('adminPlantaMenu');
          break;
        case 'analista':
          setView('analistaMenu');
          break;
        default:
          setUserRole(null);
          setCurrentUser(null);
          setView('login');
          setLoginError(`Rol de usuario "${userInfo.role}" no reconocido por el sistema.`);
          return;
      }

      setLoginError(null);
    } catch (error) {
        if (error instanceof Error) {
            setLoginError(error.message || 'No se pudo conectar al servidor.');
        } else {
            setLoginError('Ocurrió un error inesperado.');
        }
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  const handleLogout = () => {
    setUserRole(null);
    setCurrentUser(null);
    setView('login');
    setSelectedTask(null);
    setPreviousView(null);
    setTasks([]);
  }

  const handleChangePassword = async (currentPin: string, newPin: string): Promise<void> => {
      if (!currentUser) {
          return Promise.reject(new Error('No hay un usuario conectado.'));
      }
      try {
          const response = await fetch('http://localhost:3001/api/users/change-password', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  codigo_operario: currentUser.codigo_operario,
                  currentPin,
                  newPin
              }),
          });
          const data = await response.json();
          if (!response.ok) {
              throw new Error(data.message || 'Error al cambiar la contraseña.');
          }
          alert('¡Contraseña cambiada con éxito!');
          setChangePasswordModalOpen(false);
          return Promise.resolve();
      } catch (err) {
          return Promise.reject(err);
      }
  };

  const handleSelectTask = (task: TaskData) => {
    setSelectedTask(tasks.find(t => t.id === task.id) || null);
    setView('taskDetail');
  };

  const handleBackToTracker = () => {
    setView('tracker');
    setSelectedTask(null);
  };
  
  const handleBackToAdminMenu = () => {
      if (userRole) {
          switch (userRole) {
              case 'supervisor':
                  setView('supervisorMenu');
                  break;
              case 'root':
                  setView('rootMenu');
                  break;
              case 'admin_planta':
                  setView('adminPlantaMenu');
                  break;
              case 'analista':
                  setView('analistaMenu');
                  break;
              default:
                  setView('login');
          }
      } else {
          setView('login');
      }
  };
  
  const handleNavigate = (page: AdminPage) => {
    setView(page);
  };

  const handleGoToUnproductive = (task: TaskData) => {
     setTasks(prevTasks =>
      prevTasks.map(t => {
        if (t.id === task.id && t.status === 'In Progress' && t.startTime) {
          const elapsed = (Date.now() - t.startTime) / 1000;
          return {
            ...t,
            totalElapsedTime: (t.totalElapsedTime || 0) + elapsed,
            startTime: null, 
          };
        }
        return t;
      })
    );
    setPreviousView(view as 'tracker' | 'taskDetail');
    setSelectedTask(prev => tasks.find(t => t.id === (prev?.id || task.id)) || null);
    setView('unproductive');
  };
  
  const handleGoToFinishTask = (task: TaskData) => {
    setSelectedTask(task);
    setView('finishTask');
  }

  const handleBackFromUnproductive = () => {
    if (previousView) {
      setView(previousView);
      if (previousView === 'tracker') {
        setSelectedTask(null); 
      }
      setPreviousView(null);
    } else {
      setView('tracker'); 
      setSelectedTask(null);
    }
  };

  const handleStartTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        alert('Error: No se encontró la tarea para iniciar.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3001/api/tasks/${task.db_id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'EN_PROGRESO' }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar el estado de la tarea.');
        }

        setTasks(prevTasks =>
            prevTasks.map(t =>
                t.id === taskId ? { ...t, status: 'In Progress' as const, startTime: Date.now() } : t
            )
        );
    } catch (err) {
        alert(err instanceof Error ? err.message : 'Ocurrió un error inesperado al iniciar la tarea.');
    }
  };

  const promptStartTask = (taskId: string) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      setConfirmationModalConfig({
          title: 'Confirmar Inicio de Tarea',
          message: <>¿Estás seguro de que quieres iniciar la tarea <strong>{task.id}</strong>?</>,
          confirmButtonText: 'Sí, Iniciar',
          confirmButtonClass: 'bg-blue-600 hover:bg-blue-700',
          onConfirm: async () => {
              setIsSubmitting(true);
              await handleStartTask(taskId);
              setIsSubmitting(false);
              setConfirmationModalConfig(null);
              // Navigate to details page if starting from card
              if (view === 'tracker') {
                  handleSelectTask(task);
              }
          },
          icon: 'play_circle_outline',
          iconClass: 'text-blue-600 bg-blue-100',
      });
  };

  const handleRegisterUnproductiveCause = async (taskId: string, cause: string, observations: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        alert('Error: No se encontró la tarea.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3001/api/tasks/${task.db_id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'PAUSADA' }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al registrar la causa improductiva.');
        }

        const newEvent: UnproductiveEvent = { cause, observations, startTime: Date.now(), endTime: null, duration: 0 };
        setTasks(prevTasks =>
            prevTasks.map(t => {
                if (t.id === taskId) {
                    return {
                        ...t,
                        status: 'Unproductive Cause in Progress' as const,
                        unproductiveEvents: [...(t.unproductiveEvents || []), newEvent]
                    };
                }
                return t;
            })
        );
        handleBackFromUnproductive();
    } catch (err) {
        alert(err instanceof Error ? err.message : 'Ocurrió un error inesperado al registrar la causa.');
    }
  };

  const handleFinishUnproductiveCause = async (taskId: string) => {
     const task = tasks.find(t => t.id === taskId);
    if (!task) {
        alert('Error: No se encontró la tarea.');
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3001/api/tasks/${task.db_id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'EN_PROGRESO' }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al reanudar la tarea.');
        }

        setTasks(prevTasks =>
            prevTasks.map(t => {
                if (t.id === taskId && t.status === 'Unproductive Cause in Progress') {
                    const updatedEvents = [...(t.unproductiveEvents || [])];
                    const activeEventIndex = updatedEvents.findIndex(e => e.endTime === null);

                    if (activeEventIndex > -1) {
                        const activeEvent = updatedEvents[activeEventIndex];
                        const endTime = Date.now();
                        updatedEvents[activeEventIndex] = {
                            ...activeEvent,
                            endTime: endTime,
                            duration: (endTime - activeEvent.startTime) / 1000
                        };
                    }

                    return {
                        ...t,
                        status: 'In Progress' as const,
                        startTime: Date.now(),
                        unproductiveEvents: updatedEvents,
                    };
                }
                return t;
            })
        );

    } catch (err) {
        alert(err instanceof Error ? err.message : 'Ocurrió un error inesperado al reanudar la tarea.');
    }
  };

  const promptFinishUnproductiveCause = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        const activeEvent = task.unproductiveEvents?.find(e => e.endTime === null);
        setConfirmationModalConfig({
            title: 'Confirmar Fin de Causa Improductiva',
            message: <>¿Estás seguro de que quieres finalizar la causa "<strong>{activeEvent?.cause || 'Improductiva'}</strong>" y reanudar la tarea?</>,
            confirmButtonText: 'Sí, Reanudar',
            confirmButtonClass: 'bg-amber-500 hover:bg-amber-600',
            onConfirm: async () => {
                setIsSubmitting(true);
                await handleFinishUnproductiveCause(taskId);
                setIsSubmitting(false);
                setConfirmationModalConfig(null);
            },
            icon: 'play_circle_filled',
            iconClass: 'text-amber-600 bg-amber-100',
        });
    };

  const handleTaskSubmit = async (taskId: string, formData: any) => {
    console.log('Task finished:', taskId, formData);
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        alert('Error: No se encontró la tarea.');
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:3001/api/tasks/${task.db_id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'FINALIZADA' }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al finalizar la tarea.');
        }

        setTasks(prevTasks =>
            prevTasks.map(t => {
                if (t.id === taskId) {
                    let finalElapsedTime = t.totalElapsedTime || 0;
                    if (t.status === 'In Progress' && t.startTime) {
                        const elapsed = (Date.now() - t.startTime) / 1000;
                        finalElapsedTime += elapsed;
                    }
                    return { ...t, status: 'Completed' as const, totalElapsedTime: finalElapsedTime, startTime: null };
                }
                return t;
            })
        );
        alert('¡Tarea finalizada con éxito!');
        handleBackToTracker();
    } catch (err) {
         alert(err instanceof Error ? err.message : 'Ocurrió un error inesperado al finalizar la tarea.');
    }
  };
  
  const handleCreateTask = async (newTaskData: NewTaskPayload) => {
      setIsSubmitting(true);
       if (!currentUser) {
          alert('Error: No se ha podido identificar al usuario creador. Por favor, inicie sesión de nuevo.');
          setIsSubmitting(false);
          setConfirmationModalConfig(null);
          return;
      }
      try {
          const date = new Date();
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getDate().toString().padStart(2, '0');
          const prefix = `MO${year}${month}${day}`;

          let maxIdNum = 0;
          tasks.forEach(task => {
              if (task.id.startsWith(prefix)) {
                  const num = parseInt(task.id.split('-')[1], 10);
                  if (num > maxIdNum) {
                      maxIdNum = num;
                  }
              }
          });
          const newId = `${prefix}-${(maxIdNum + 1).toString().padStart(3, '0')}`;

          const response = await fetch('http://localhost:3001/api/tasks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  task_code: newId,
                  order_id: newTaskData.order_id,
                  user_id: newTaskData.user_id,
                  work_center_id: newTaskData.work_center_id,
                  product_operation_id: newTaskData.product_operation_id,
                  created_by_id: currentUser.id,
              }),
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Error al crear la tarea.');
          }
          
          await fetchTasks();
          alert('¡Nueva tarea creada con éxito!');
          setOrderForNewTask(null);
          handleBackToAdminMenu();

      } catch (err) {
          alert(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
      } finally {
          setIsSubmitting(false);
          setConfirmationModalConfig(null);
      }
  };
  
  const promptCreateTask = (newTaskData: NewTaskPayload) => {
      setConfirmationModalConfig({
          title: 'Confirmar Creación de Tarea',
          message: (
              <div className="space-y-3 text-left">
                  <p>Por favor, revise los detalles de la nueva tarea:</p>
                  <ul className="list-none space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
                      <li className="flex justify-between items-center">
                          <span className="font-medium text-slate-500">Orden de Prod.:</span>
                          <strong className="text-slate-800">{newTaskData.productionOrderNumber}</strong>
                      </li>
                      <li className="flex justify-between items-center">
                          <span className="font-medium text-slate-500">Producto:</span>
                          <strong className="text-slate-800 text-right">{newTaskData.partRef}</strong>
                      </li>
                        <li className="flex justify-between items-center">
                          <span className="font-medium text-slate-500">Cantidad:</span>
                          <strong className="text-slate-800">{newTaskData.qty}</strong>
                      </li>
                      <li className="flex justify-between items-center">
                          <span className="font-medium text-slate-500">Operación:</span>
                          <strong className="text-slate-800">{newTaskData.op}</strong>
                      </li>
                      <li className="flex justify-between items-center">
                          <span className="font-medium text-slate-500">Equipo:</span>
                          <strong className="text-slate-800">{newTaskData.equipment}</strong>
                      </li>
                      <li className="flex justify-between items-center">
                          <span className="font-medium text-slate-500">Operador:</span>
                          <strong className="text-slate-800">{newTaskData.operator}</strong>
                      </li>
                  </ul>
              </div>
          ),
          confirmButtonText: 'Sí, Crear Tarea',
          confirmButtonClass: 'bg-blue-600 hover:bg-blue-700',
          onConfirm: () => handleCreateTask(newTaskData),
          onCancel: () => {
              setConfirmationModalConfig(null);
          },
          icon: 'add_task',
          iconClass: 'text-blue-600 bg-blue-100',
      });
  };

  const executeCreateOrder = async (orderData: {
    orden_numero: string;
    product_id: number;
    product_name: string;
    cantidad_requerida: number;
    fecha_inicio_programada: string;
  }) => {
        if (!currentUser) {
            setConfirmationModalConfig(null);
            alert('Error: No se ha podido identificar al usuario creador.');
            setIsSubmitting(false); // Reset submitting state on early exit
            return;
        }

        // isSubmitting is set by the caller (the modal's onConfirm)
        
        try {
            const response = await fetch('http://localhost:3001/api/production-orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...orderData,
                    created_by_id: currentUser.id
                }),
            });
            const newOrder = await response.json();
            if (!response.ok) {
                throw new Error(newOrder.message || 'Error al crear la orden de producción.');
            }
            
            setOrderForNewTask({ 
                id: newOrder.id, 
                product_id: newOrder.product_id,
                orden_numero: newOrder.orden_numero,
                product_name: newOrder.product_name,
                cantidad_requerida: newOrder.cantidad_requerida,
            });

            setConfirmationModalConfig({
                title: 'Orden Creada con Éxito',
                message: <>La orden <strong>{newOrder.orden_numero}</strong> ha sido creada. ¿Desea crear una tarea para esta orden ahora?</>,
                confirmButtonText: 'Sí, Crear Tarea',
                confirmButtonClass: 'bg-blue-600 hover:bg-blue-700',
                onConfirm: () => {
                    handleNavigate('supervisorCreateTask');
                    setConfirmationModalConfig(null);
                },
                cancelButtonText: 'No, Volver al Menú',
                onCancel: () => {
                    setOrderForNewTask(null);
                    setConfirmationModalConfig(null);
                    handleBackToAdminMenu();
                },
                icon: 'task_alt',
                iconClass: 'text-green-600 bg-green-100',
            });

        } catch (error) {
            setConfirmationModalConfig({
                title: 'Error al Crear Orden',
                message: error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
                confirmButtonText: 'Aceptar',
                confirmButtonClass: 'bg-red-600 hover:bg-red-700',
                onConfirm: () => setConfirmationModalConfig(null),
                icon: 'error',
                iconClass: 'text-red-600 bg-red-100',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const promptAndCreateOrder = (orderData: { 
        orden_numero: string; 
        product_id: number;
        product_name: string;
        cantidad_requerida: number;
        fecha_inicio_programada: string;
    }) => {
        setConfirmationModalConfig({
            title: 'Confirmar Creación de Orden',
            message: (
                <div className="space-y-3 text-left">
                    <p>Por favor, revise los detalles de la nueva orden de producción:</p>
                    <ul className="list-none space-y-2 bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm">
                        <li className="flex justify-between items-center">
                            <span className="font-medium text-slate-500">Nº de Orden:</span>
                            <strong className="text-slate-800">{orderData.orden_numero}</strong>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="font-medium text-slate-500">Producto:</span>
                            <strong className="text-slate-800 text-right">{orderData.product_name}</strong>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="font-medium text-slate-500">Cantidad:</span>
                            <strong className="text-slate-800">{orderData.cantidad_requerida} Unidades</strong>
                        </li>
                        <li className="flex justify-between items-center">
                            <span className="font-medium text-slate-500">Fecha Programada:</span>
                            <strong className="text-slate-800">
                                {new Date(orderData.fecha_inicio_programada + 'T00:00:00').toLocaleDateString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                })}
                            </strong>
                        </li>
                    </ul>
                </div>
            ),
            confirmButtonText: 'Sí, Crear',
            confirmButtonClass: 'bg-blue-600 hover:bg-blue-700',
            onConfirm: () => {
                setIsSubmitting(true);
                executeCreateOrder(orderData);
            },
            onCancel: () => {
                setConfirmationModalConfig(null);
            },
            icon: 'help_outline',
            iconClass: 'text-blue-600 bg-blue-100'
        });
    };


  const renderContent = () => {
    const currentTask = tasks.find(t => t.id === selectedTask?.id) || selectedTask;
    const commonPageProps = {
        onLogout: handleLogout,
        onChangePassword: () => setChangePasswordModalOpen(true),
        currentUser,
    };

    switch (view) {
      case 'login':
        return <LoginPage onLogin={handleLogin} error={loginError} isLoggingIn={isLoggingIn} />;
      
      // New Role Menus
      case 'rootMenu':
        return <RootMenuPage {...commonPageProps} onNavigate={handleNavigate} />;
      case 'adminPlantaMenu':
        return <AdminPlantaMenuPage {...commonPageProps} onNavigate={handleNavigate} />;
      case 'analistaMenu':
        return <AnalistaMenuPage {...commonPageProps} onNavigate={handleNavigate} />;

      // Supervisor Views
      case 'supervisorMenu':
        return <SupervisorMenuPage {...commonPageProps} onNavigate={handleNavigate} />;
      case 'supervisorCreateTask':
        return <SupervisorCreateTaskPage 
                    {...commonPageProps} 
                    onInitiateCreateTask={promptCreateTask} 
                    onBack={() => {
                        setOrderForNewTask(null);
                        handleBackToAdminMenu();
                    }}
                    preselectedOrder={orderForNewTask}
                />;
      case 'supervisorTaskList':
        return <SupervisorTaskListPage {...commonPageProps} tasks={tasks} onBack={handleBackToAdminMenu} />;
      case 'supervisorUserManagement':
        return <SupervisorUserManagementPage {...commonPageProps} onBack={handleBackToAdminMenu} userRole={userRole} />;
      case 'unproductiveCauseManagement':
        return <UnproductiveCauseManagementPage {...commonPageProps} onBack={handleBackToAdminMenu} userRole={userRole} />;
      case 'machineManagement':
        return <MachineManagementPage {...commonPageProps} onBack={handleBackToAdminMenu} userRole={userRole} />;
      case 'createProductionOrder':
        return <CreateProductionOrderPage 
                    {...commonPageProps} 
                    onBack={handleBackToAdminMenu} 
                    onInitiateCreateOrder={promptAndCreateOrder}
                    isSubmitting={isSubmitting}
                />;
      case 'productionOrderList':
        return <ProductionOrderListPage {...commonPageProps} onBack={handleBackToAdminMenu} />;
      
      // Operator Views
      case 'tracker':
        return <ProductionTrackerPage {...commonPageProps} tasks={tasks} onSelectTask={handleSelectTask} onRecordUnproductive={handleGoToUnproductive} onFinishTask={handleGoToFinishTask} onStartTask={promptStartTask} onFinishUnproductiveCause={promptFinishUnproductiveCause} />;
      case 'taskDetail':
        if (currentTask) {
          return <TaskDetailsPage {...commonPageProps} task={currentTask} onBack={handleBackToTracker} onRecordUnproductive={handleGoToUnproductive} onFinishTask={handleGoToFinishTask} onStartTask={promptStartTask} onFinishUnproductiveCause={promptFinishUnproductiveCause} />;
        }
        setView('tracker');
        return null;
      case 'unproductive':
        if (currentTask) {
            return <UnproductiveCausePage 
                {...commonPageProps}
                task={currentTask} 
                onBack={handleBackFromUnproductive} 
                onRegisterUnproductiveCause={handleRegisterUnproductiveCause}
            />
        }
        setView('tracker');
        return null;
      case 'finishTask':
        if (currentTask) {
            return <FinishTaskPage {...commonPageProps} task={currentTask} onBack={handleBackToTracker} onTaskSubmit={handleTaskSubmit} />;
        }
        setView('tracker');
        return null;
      default:
        return <LoginPage onLogin={handleLogin} error={loginError} isLoggingIn={isLoggingIn} />;
    }
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      {renderContent()}
      <ConfirmationModal
          isOpen={!!confirmationModalConfig}
          onClose={() => {
            if (confirmationModalConfig?.onCancel) {
                confirmationModalConfig.onCancel();
            }
            setConfirmationModalConfig(null);
          }}
          onConfirm={confirmationModalConfig?.onConfirm}
          title={confirmationModalConfig?.title || ''}
          message={confirmationModalConfig?.message || ''}
          confirmButtonText={confirmationModalConfig?.confirmButtonText || ''}
          confirmButtonClass={confirmationModalConfig?.confirmButtonClass || ''}
          cancelButtonText={confirmationModalConfig?.cancelButtonText}
          icon={confirmationModalConfig?.icon}
          iconClass={confirmationModalConfig?.iconClass}
          isLoading={isSubmitting}
      />
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
        onSubmit={handleChangePassword}
      />
    </div>
  );
};

export default App;