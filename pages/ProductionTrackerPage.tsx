

import React, { useState, useEffect } from 'react';
import ProductionHeader from '../components/ProductionHeader';
import { UserInfo } from '../App';

export interface UnproductiveEvent {
  cause: string;
  observations: string;
  startTime: number;
  endTime: number | null;
  duration: number; // in seconds
}

export interface TaskData {
  db_id: number;
  id: string;
  status: 'Pending' | 'In Progress' | 'Unproductive Cause in Progress' | 'Completed';
  partRef: string;
  op: string;
  equipment: string;
  qty: number;
  imageUrl: string;
  startTime: number | null;
  totalElapsedTime: number;
  unproductiveEvents: UnproductiveEvent[];
  operator?: string;
  productionOrderNumber?: string;
}

interface ProductionTrackerPageProps {
  tasks: TaskData[];
  onLogout: () => void;
  onSelectTask: (task: TaskData) => void;
  onRecordUnproductive: (task: TaskData) => void;
  onFinishTask: (task: TaskData) => void;
  onStartTask: (taskId: string) => void;
  onFinishUnproductiveCause: (taskId: string) => void;
  onChangePassword: () => void;
  currentUser: UserInfo | null;
}

const formatDuration = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) {
        return '00:00:00';
    }
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

const Timer: React.FC<{ startTime: number | null | undefined; totalElapsedTime?: number | undefined; isRunning?: boolean }> = ({ startTime, totalElapsedTime = 0, isRunning = true }) => {
    const [displayTime, setDisplayTime] = useState(totalElapsedTime);

    useEffect(() => {
        if (startTime && isRunning) {
            const intervalId = setInterval(() => {
                const elapsed = (Date.now() - startTime) / 1000;
                setDisplayTime(totalElapsedTime + elapsed);
            }, 1000);
            return () => clearInterval(intervalId);
        } else {
             setDisplayTime(totalElapsedTime);
        }
    }, [startTime, totalElapsedTime, isRunning]);

    return <span>{formatDuration(displayTime)}</span>;
};


const ProductionTrackerPage: React.FC<ProductionTrackerPageProps> = ({ tasks, onLogout, onSelectTask, onRecordUnproductive, onFinishTask, onStartTask, onFinishUnproductiveCause, onChangePassword, currentUser }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let formatted = new Intl.DateTimeFormat('es-ES', options).format(date);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  const activeTasks = tasks.filter(task => task.status !== 'Completed');
  const completedTasks = tasks.filter(task => task.status === 'Completed');

  return (
    <>
      <style>{`
        .task-scroller {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f8fafc;
        }
        .task-scroller::-webkit-scrollbar {
          height: 8px;
        }
        .task-scroller::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .task-scroller::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 4px;
        }
        .task-scroller::-webkit-scrollbar-thumb:hover {
          background-color: #94a3b8;
        }
      `}</style>
      <div className="layout-container flex h-full grow flex-col">
        <ProductionHeader onLogout={onLogout} onChangePassword={onChangePassword} currentUser={currentUser} />
        <main className="flex flex-1 justify-center py-8 px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40">
          <div className="layout-content-container flex w-full max-w-5xl flex-1 flex-col">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-1">
                <p className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">Bienvenida, Sara</p>
                <p className="text-sm font-normal leading-normal text-slate-500">{formatDate(currentTime)} | Turno: Mañana</p>
              </div>
              <div className="text-right">
                  <p className="text-3xl font-bold leading-tight text-slate-900">{formatTime(currentTime)}</p>
                  <p className="text-sm font-normal leading-normal text-slate-500">Hora Actual</p>
              </div>
            </div>
            <h2 className="px-4 pt-2 pb-4 text-xl font-semibold leading-tight tracking-tight text-slate-800 sm:text-2xl">Mis Tareas Asignadas Hoy</h2>
            <div className="task-scroller flex overflow-x-auto gap-6 p-4">
              {activeTasks.map(task => (
                  <div key={task.id} className="w-96 flex-shrink-0">
                    <TaskCard 
                      task={task} 
                      onSelectTask={() => onSelectTask(task)} 
                      onRecordUnproductive={() => onRecordUnproductive(task)} 
                      onFinishTask={() => onFinishTask(task)}
                      onStartTask={onStartTask}
                      onFinishUnproductiveCause={onFinishUnproductiveCause}
                    />
                  </div>
              ))}
            </div>
            <details className="group mt-8 rounded-lg border border-slate-200 bg-white shadow-sm" open>
              <summary className="flex cursor-pointer list-none items-center justify-between p-4">
                <h2 className="text-xl font-semibold leading-tight tracking-tight text-slate-800 sm:text-2xl">Historial de Hoy</h2>
                <span className="material-icons transition-transform duration-300 group-open:rotate-180">expand_more</span>
              </summary>
              <div className="space-y-4 border-t border-slate-200 p-4">
                {completedTasks.map(task => (
                    <CompletedTaskHistoryItem key={task.id} task={task} />
                ))}
                <GenericHistoryItem type="Completed" time="10:00 AM - 11:00 AM" details="MO20241021-006 | Ref. Parte: PRT-99001 | Op: Limpieza | Eq: Estación Limpieza 1 | Cant: 150" />
                <GenericHistoryItem type="Completed" time="11:30 AM - 12:30 PM" details="MO20241021-007 | Ref. Parte: PRT-22334 | Op: Ensamblaje | Eq: Línea 2 | Cant: 120" />
                <GenericHistoryItem type="Unproductive" time="1:00 PM - 1:30 PM" details="Fallo de Equipo | Línea 1" />
              </div>
            </details>
          </div>
        </main>
      </div>
    </>
  );
};

const statusStyles = {
  Pending: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'In Progress': 'bg-sky-100 text-sky-700 border-sky-300',
  'Unproductive Cause in Progress': 'bg-orange-100 text-orange-700 border-orange-300',
  'Completed': 'bg-green-100 text-green-700 border-green-300',
};

type TaskCardProps = {
  task: TaskData;
  onSelectTask: () => void;
  onRecordUnproductive: () => void;
  onFinishTask: () => void;
  onStartTask: (taskId: string) => void;
  onFinishUnproductiveCause: (taskId: string) => void;
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onSelectTask, onRecordUnproductive, onFinishTask, onStartTask, onFinishUnproductiveCause }) => {
  const { id, status, partRef, op, equipment, qty, imageUrl, startTime, totalElapsedTime, operator, productionOrderNumber } = task;
  const containerClasses = `flex flex-col gap-4 rounded-lg bg-white shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300 h-full`;
  
  const handleStartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onStartTask(id);
  };

  const handleFinishUnproductiveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onFinishUnproductiveCause(id);
  };

  const handleRecordUnproductiveClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onRecordUnproductive();
  };

  const handleFinishTaskClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onFinishTask();
  };

  return (
    <div className={containerClasses + ' cursor-pointer'} onClick={onSelectTask}>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold leading-tight text-slate-800">{id}</p>
              <span className={`rounded-full border py-1 px-2.5 text-xs font-medium ${statusStyles[status]}`}>{status === 'Pending' ? 'Pendiente' : status === 'In Progress' ? 'En Progreso' : status === 'Unproductive Cause in Progress' ? 'Causa Improductiva' : 'Completada'}</span>
            </div>
            {productionOrderNumber && <p className="text-xs font-semibold leading-normal text-blue-600">Orden Prod.: {productionOrderNumber}</p>}
            <p className="text-sm font-normal leading-normal text-slate-600">Ref. Parte: {partRef} | Op: {op}</p>
            <p className="text-sm font-normal leading-normal text-slate-600">Equipo: {equipment} | Cant: {qty}</p>
            {operator && <p className="text-sm font-normal leading-normal text-slate-600">Asignado a: <span className="font-medium">{operator}</span></p>}
            {status === 'In Progress' && (
              <div className="flex items-center gap-2 text-sm text-slate-500 mt-2 pt-2 border-t border-slate-100">
                  <span className="material-icons text-lg text-blue-500">timer</span>
                  <span className="font-medium">
                      Duración de Tarea: <span className="font-bold text-slate-700"><Timer startTime={startTime} totalElapsedTime={totalElapsedTime} /></span>
                  </span>
              </div>
            )}
            {status === 'Unproductive Cause in Progress' && (() => {
                const activeEvent = task.unproductiveEvents?.find(e => e.endTime === null);
                return (
                  <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span className="material-icons text-lg text-blue-500">timer</span>
                          <span className="font-medium">
                              Tiempo Productivo Total: <span className="font-bold text-slate-700">{formatDuration(totalElapsedTime)}</span>
                          </span>
                      </div>
                      {activeEvent && (
                          <div className="flex items-center gap-2 text-sm text-red-500">
                              <span className="material-icons text-lg animate-pulse">pause_circle</span>
                              <span className="font-medium">
                                  {activeEvent.cause}: <span className="font-bold text-red-700"><Timer startTime={activeEvent.startTime} totalElapsedTime={0} /></span>
                              </span>
                          </div>
                      )}
                  </div>
                );
            })()}
        </div>
        <div className="aspect-[16/9] w-full rounded-md border border-slate-200 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url("${imageUrl}")` }}></div>
      </div>

      <div onClick={(e) => e.stopPropagation()} className="pt-2">
        {status === 'Pending' && <ActionButton icon="play_arrow" text="INICIAR TAREA" color="blue" onClick={handleStartClick} />}
        {status === 'In Progress' && (
          <div className="flex flex-col gap-2 sm:flex-row">
            <ActionButton icon="check_circle" text="FINALIZAR TAREA" color="green" isFlex onClick={handleFinishTaskClick} />
            <ActionButton icon="warning" text="REGISTRAR IMPRODUCTIVIDAD" color="slate" isFlex onClick={handleRecordUnproductiveClick} />
          </div>
        )}
        {status === 'Unproductive Cause in Progress' && (
            <ActionButton icon="play_circle_filled" text="FINALIZAR CAUSA IMPRODUCTIVA" color="amber" onClick={handleFinishUnproductiveClick} />
        )}
      </div>
    </div>
  );
};

const ActionButton: React.FC<{icon:string, text:string, color:string, isFlex?:boolean, onClick: (e: React.MouseEvent<HTMLButtonElement>) => void}> = ({icon, text, color, isFlex, onClick}) => {
    const colorStyles = {
        blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
        sky: 'bg-sky-500 hover:bg-sky-600 focus:ring-sky-500 text-white',
        amber: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 text-white',
        green: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white',
        slate: 'bg-slate-200 hover:bg-slate-300 focus:ring-slate-400 text-slate-700'
    }
    return (
        <button onClick={onClick} className={`flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 px-4 text-sm font-medium leading-normal transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorStyles[color]} ${isFlex ? 'flex-1': ''}`}>
            <span className="material-icons mr-2 text-base">{icon}</span>
            <span className="truncate">{text}</span>
        </button>
    )
}

const CompletedTaskHistoryItem: React.FC<{ task: TaskData }> = ({ task }) => {
    const { id, partRef, op, equipment, qty, totalElapsedTime, unproductiveEvents, productionOrderNumber } = task;
    return (
        <div className="flex items-start gap-3 rounded-md border p-3 border-slate-200 bg-slate-50">
            <span className="material-icons mt-1 text-green-500">check_circle_outline</span>
            <div className="flex w-full flex-col gap-1">
                <p className="text-base font-medium leading-normal text-slate-800">Tarea Completada</p>
                {productionOrderNumber && <p className="text-xs font-semibold leading-normal text-blue-600">Orden Prod.: {productionOrderNumber}</p>}
                <p className="text-sm font-normal leading-normal text-slate-600">{`${id} | Ref. Parte: ${partRef} | Op: ${op} | Eq: ${equipment} | Cant: ${qty}`}</p>
                <p className="text-sm font-medium text-slate-500">Duración Productiva Total: <span className="font-semibold">{formatDuration(totalElapsedTime)}</span></p>
                {(unproductiveEvents || []).filter(e => e.duration > 0).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                        <p className="text-sm font-medium text-red-700">Períodos Improductivos:</p>
                        <ul className="list-none pl-1 mt-1 space-y-1 text-sm text-red-600">
                            {unproductiveEvents.filter(e => e.duration > 0).map((event, index) => (
                                <li key={index} className="flex items-center gap-1.5">
                                    <span className="material-icons text-base">error_outline</span>
                                    <span>{event.cause}: <strong>{formatDuration(event.duration)}</strong> {event.observations && `(${event.observations})`}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

const GenericHistoryItem: React.FC<{ type: 'Completed' | 'Unproductive'; time: string; details: string, duration?: number }> = ({ type, time, details, duration }) => {
  const isCompleted = type === 'Completed';
  return (
    <div className={`flex items-start gap-3 rounded-md border p-3 ${isCompleted ? 'border-slate-200 bg-slate-50' : 'border-red-200 bg-red-50'}`}>
      <span className={`material-icons mt-1 ${isCompleted ? 'text-green-500' : 'text-red-500'}`}>
        {isCompleted ? 'check_circle_outline' : 'error_outline'}
      </span>
      <div className="flex flex-col gap-1">
        <p className={`text-base font-medium leading-normal ${isCompleted ? 'text-slate-800' : 'text-red-700'}`}>{isCompleted ? 'Tarea Completada' : 'Tiempo Improductivo'}: {time}</p>
        <p className={`text-sm font-normal leading-normal ${isCompleted ? 'text-slate-600' : 'text-red-600'}`}>{details}</p>
        {isCompleted && typeof duration === 'number' && (
             <p className="text-sm font-medium text-slate-500">Duración Total: <span className="font-semibold">{formatDuration(duration)}</span></p>
        )}
      </div>
    </div>
  );
};


export default ProductionTrackerPage;