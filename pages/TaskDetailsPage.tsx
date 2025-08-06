
import React, { useState, useEffect } from 'react';
import { TaskData } from './ProductionTrackerPage';
import TaskDetailsHeader from '../components/TaskDetailsHeader';
import { UserInfo } from '../App';

interface TaskDetailsPageProps {
  task: TaskData;
  onBack: () => void;
  onLogout: () => void;
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

const Timer: React.FC<{ startTime: number | null | undefined; totalElapsedTime: number | undefined; }> = ({ startTime, totalElapsedTime = 0 }) => {
    const [displayTime, setDisplayTime] = useState(totalElapsedTime);

    useEffect(() => {
        if (startTime) {
            const intervalId = setInterval(() => {
                const elapsed = (Date.now() - startTime) / 1000;
                setDisplayTime(totalElapsedTime + elapsed);
            }, 1000);
            return () => clearInterval(intervalId);
        } else {
            setDisplayTime(totalElapsedTime);
        }
    }, [startTime, totalElapsedTime]);

    return <span>{formatDuration(displayTime)}</span>;
};


const TaskDetailsPage: React.FC<TaskDetailsPageProps> = ({ task, onBack, onLogout, onRecordUnproductive, onFinishTask, onStartTask, onFinishUnproductiveCause, onChangePassword, currentUser }) => {
    const statusText = task.status === 'Pending' ? 'Pendiente' : task.status === 'In Progress' ? 'En Progreso' : task.status === 'Unproductive Cause in Progress' ? 'Causa Improductiva' : 'Completada';
  return (
    <div className="layout-container flex h-full grow flex-col">
      <TaskDetailsHeader onBack={onBack} onLogout={onLogout} onChangePassword={onChangePassword} currentUser={currentUser} />
      <main className="flex flex-1 justify-center py-8 px-4 sm:py-12 sm:px-6">
        <div className="layout-content-container flex w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
          <div className="border-b border-slate-200 bg-slate-50 p-6 sm:p-8">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
              <div>
                <h2 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 sm:text-3xl">Detalles de la Tarea</h2>
                <p className="mt-1 text-sm font-normal leading-normal text-slate-600">
                  Orden de Fabricación: <span className="font-medium text-slate-700">{task.id}</span>
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 rounded-lg border-blue-200 bg-blue-50 py-2 px-3 text-blue-600">
                  <span className="material-icons text-lg">timer</span>
                  <p className="text-sm font-medium">
                    Tiempo Productivo Total: <span className="font-bold"><Timer startTime={task.startTime} totalElapsedTime={task.totalElapsedTime} /></span>
                  </p>
                </div>
                {task.status === 'Unproductive Cause in Progress' && (() => {
                    const activeEvent = task.unproductiveEvents?.find(e => e.endTime === null);
                    if (!activeEvent) return null;
                    return (
                        <div className="flex animate-pulse items-center gap-2 rounded-lg border-orange-200 bg-orange-50 py-2 px-3 text-orange-600">
                            <span className="material-icons text-lg">pause_circle</span>
                            <p className="text-sm font-medium">
                                {activeEvent.cause}: <span className="font-bold"><Timer startTime={activeEvent.startTime} totalElapsedTime={0} /></span>
                            </p>
                        </div>
                    );
                })()}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-y-6 gap-x-8 p-6 text-sm sm:p-8 md:grid-cols-[max-content_1fr]">
            <div className="col-span-1 grid grid-cols-1 items-center gap-x-4 gap-y-1 border-b border-slate-200 py-4 md:col-span-2 md:grid-cols-[max-content_1fr]">
              <p className="font-medium leading-normal text-slate-500">Estado:</p>
              <p className="font-semibold leading-normal text-slate-800">{statusText}</p>
            </div>
            <div className="col-span-1 grid grid-cols-1 items-center gap-x-4 gap-y-1 border-b border-slate-200 py-4 md:col-span-2 md:grid-cols-[max-content_1fr]">
              <p className="font-medium leading-normal text-slate-500">Pieza:</p>
              <p className="font-normal leading-normal text-slate-800">
                {task.partRef} - <span className="text-slate-600">{task.op}</span>
              </p>
            </div>
            <div className="col-span-1 grid grid-cols-1 items-center gap-x-4 gap-y-1 border-b border-slate-200 py-4 md:col-span-2 md:grid-cols-[max-content_1fr]">
              <p className="font-medium leading-normal text-slate-500">Máquina:</p>
              <p className="font-normal leading-normal text-slate-800">{task.equipment}</p>
            </div>
            {task.operator && (
                <div className="col-span-1 grid grid-cols-1 items-center gap-x-4 gap-y-1 border-b border-slate-200 py-4 md:col-span-2 md:grid-cols-[max-content_1fr]">
                  <p className="font-medium leading-normal text-slate-500">Operador:</p>
                  <p className="font-normal leading-normal text-slate-800">{task.operator}</p>
                </div>
            )}
            <div className="col-span-1 grid grid-cols-1 items-center gap-x-4 gap-y-1 py-4 md:col-span-2 md:grid-cols-[max-content_1fr]">
              <p className="font-medium leading-normal text-slate-500">Cantidad a Producir:</p>
              <p className="text-lg font-semibold leading-normal text-slate-800">
                {task.qty} <span className="text-sm font-normal text-slate-600">Unidades</span>
              </p>
            </div>
          </div>
          <div className="mt-auto border-t border-slate-200 bg-slate-50 p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {task.status === 'Pending' && (
                    <button onClick={() => onStartTask(task.id)} className="flex h-12 min-w-[84px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-base font-semibold leading-normal tracking-wide text-white shadow-sm transition-colors duration-150 hover:bg-blue-700 sm:col-span-2">
                        <span className="material-icons">play_arrow</span>
                        <span className="truncate">Iniciar Tarea</span>
                    </button>
                )}
                {task.status === 'In Progress' && (
                    <>
                        <button onClick={() => onRecordUnproductive(task)} className="flex h-12 min-w-[84px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-red-600 px-5 text-base font-semibold leading-normal tracking-wide text-white shadow-sm transition-colors duration-150 hover:bg-red-700">
                            <span className="material-icons">warning</span>
                            <span className="truncate">Registrar Causa Improductiva</span>
                        </button>
                        <button onClick={() => onFinishTask(task)} className="flex h-12 min-w-[84px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-green-600 px-5 text-base font-semibold leading-normal tracking-wide text-white shadow-sm transition-colors duration-150 hover:bg-green-700">
                            <span className="material-icons">check_circle</span>
                            <span className="truncate">Finalizar Tarea</span>
                        </button>
                    </>
                )}
                {task.status === 'Unproductive Cause in Progress' && (
                    <button onClick={() => onFinishUnproductiveCause(task.id)} className="flex h-12 min-w-[84px] cursor-pointer items-center justify-center gap-2 rounded-lg bg-amber-500 px-5 text-base font-semibold leading-normal tracking-wide text-white shadow-sm transition-colors duration-150 hover:bg-amber-600 sm:col-span-2">
                        <span className="material-icons">play_circle_filled</span>
                        <span className="truncate">Finalizar Causa Improductiva</span>
                    </button>
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaskDetailsPage;