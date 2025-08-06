
import React, { useState } from 'react';
import { TaskData } from './ProductionTrackerPage';
import LogoIcon from '../components/LogoIcon';
import { UserInfo } from '../App';
import UserMenu from '../components/UserMenu';

interface FinishTaskPageProps {
  task: TaskData;
  onBack: () => void;
  onLogout: () => void;
  onTaskSubmit: (taskId: string, formData: any) => void;
  onChangePassword: () => void;
  currentUser: UserInfo | null;
}

const FinishTaskHeader: React.FC<{ onBack: () => void, onLogout: () => void, onChangePassword: () => void, currentUser: UserInfo | null }> = ({ onBack, onLogout, onChangePassword, currentUser }) => {
    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-slate-200 bg-white px-6 md:px-10 py-4 shadow-sm">
            <div className="flex items-center gap-3 text-slate-900">
                 <button onClick={onBack} aria-label="Volver" className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800">
                    <span className="material-icons">arrow_back</span>
                </button>
                <div className="size-7 text-[#0c7ff2]">
                    <LogoIcon />
                </div>
                <h1 className="text-slate-900 text-xl font-bold leading-tight tracking-tight">Sistema de Control de Calidad</h1>
            </div>
            <div className="flex items-center gap-6">
                <nav className="hidden md:flex items-center gap-6">
                    <a className="text-slate-700 hover:text-[#0c7ff2] text-sm font-medium leading-normal transition-colors" href="#">Panel</a>
                    <a className="text-slate-700 hover:text-[#0c7ff2] text-sm font-medium leading-normal transition-colors" href="#">Tareas</a>
                    <a className="text-slate-700 hover:text-[#0c7ff2] text-sm font-medium leading-normal transition-colors" href="#">Reportes</a>
                    <a className="text-slate-700 hover:text-[#0c7ff2] text-sm font-medium leading-normal transition-colors" href="#">Configuración</a>
                </nav>
                <UserMenu 
                  onLogout={onLogout}
                  onChangePassword={onChangePassword}
                  currentUser={currentUser}
                  userImage="https://lh3.googleusercontent.com/aida-public/AB6AXuCOViqsIVrYAnomoKJ2tpXsV7IQj7bH_CBzI6m0oMOl5OzDF8JTpD65jvQdzwTlAh4xYIsES8WGSBfbfh9p9E_tjQY37KrFY2rdAgPKyn8JSvDD7PW582npWWxl3enRnOtUzOMV9nw35PvN0OBLCoQtPpF7JrUpPr2g6C_cjb3hxyiKl-FA2cYve1sCpfHK-ZsKuOg3gUGSoHmKpPf_tL7aLa6JeXaEV9QYOyUmg52HB13yeb6Zqo53-f9ECQGhxeoNO-2dXjslALxW"
                />
            </div>
        </header>
    );
};


const FinishTaskPage: React.FC<FinishTaskPageProps> = ({ task, onBack, onLogout, onTaskSubmit, onChangePassword, currentUser }) => {
    const [piecesStarted, setPiecesStarted] = useState('');
    const [piecesFinished, setPiecesFinished] = useState('');
    const [orderFinished, setOrderFinished] = useState('');
    const [pnc, setPnc] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onTaskSubmit(task.id, {
            piecesStarted,
            piecesFinished,
            orderFinished,
            pnc,
        });
    };

    return (
        <>
            <style>{`
              .form-radio-custom:checked {
                background-color: #0c7ff2;
                border-color: #0c7ff2;
              }
              .form-radio-custom:checked + span {
                color: #0c7ff2;
                font-weight: 600;
              }
            `}</style>
            <div className="layout-container flex h-full grow flex-col">
                <FinishTaskHeader onBack={onBack} onLogout={onLogout} onChangePassword={onChangePassword} currentUser={currentUser} />
                <main className="flex flex-1 justify-center py-8 px-4 md:px-0">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 md:p-8">
                        <h2 className="text-slate-900 text-2xl md:text-3xl font-bold leading-tight mb-8 text-center md:text-left">Finalizar Tarea: <span className="text-slate-700 font-semibold">{task.id}</span></h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-slate-800 text-sm font-medium leading-normal pb-2" htmlFor="piecesStarted">Cantidad de Piezas Iniciadas (en esta sesión)</label>
                                <input
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[#0c7ff2] border border-slate-300 bg-slate-50 focus:border-[#0c7ff2] h-12 placeholder:text-slate-400 p-3 text-sm font-normal leading-normal"
                                    id="piecesStarted"
                                    name="piecesStarted"
                                    placeholder="Ingrese la cantidad"
                                    type="number"
                                    value={piecesStarted}
                                    onChange={(e) => setPiecesStarted(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-slate-800 text-sm font-medium leading-normal pb-2" htmlFor="piecesFinished">Cantidad de Piezas Finalizadas (en esta sesión)</label>
                                <input
                                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[#0c7ff2] border border-slate-300 bg-slate-50 focus:border-[#0c7ff2] h-12 placeholder:text-slate-400 p-3 text-sm font-normal leading-normal"
                                    id="piecesFinished"
                                    name="piecesFinished"
                                    placeholder="Ingrese la cantidad"
                                    type="number"
                                    value={piecesFinished}
                                    onChange={(e) => setPiecesFinished(e.target.value)}
                                    required
                                />
                            </div>
                            <fieldset>
                                <legend className="block text-slate-800 text-sm font-medium leading-normal pb-2">¿Orden Finalizada?</legend>
                                <div className="flex gap-4 pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-300 rounded-lg hover:border-[#0c7ff2] has-[:checked]:border-[#0c7ff2] has-[:checked]:ring-1 has-[:checked]:ring-[#0c7ff2] transition-all">
                                        <input
                                            className="form-radio-custom form-radio size-4 text-[#0c7ff2] border-slate-400 focus:ring-[#0c7ff2] focus:ring-offset-0"
                                            id="orderFinishedYes"
                                            name="orderFinished"
                                            type="radio"
                                            value="yes"
                                            checked={orderFinished === 'yes'}
                                            onChange={(e) => setOrderFinished(e.target.value)}
                                            required
                                        />
                                        <span className="text-slate-700 text-sm font-medium">Sí</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-300 rounded-lg hover:border-[#0c7ff2] has-[:checked]:border-[#0c7ff2] has-[:checked]:ring-1 has-[:checked]:ring-[#0c7ff2] transition-all">
                                        <input
                                            className="form-radio-custom form-radio size-4 text-[#0c7ff2] border-slate-400 focus:ring-[#0c7ff2] focus:ring-offset-0"
                                            id="orderFinishedNo"
                                            name="orderFinished"
                                            type="radio"
                                            value="no"
                                            checked={orderFinished === 'no'}
                                            onChange={(e) => setOrderFinished(e.target.value)}
                                            required
                                        />
                                        <span className="text-slate-700 text-sm font-medium">No</span>
                                    </label>
                                </div>
                            </fieldset>
                            <div>
                                <label className="block text-slate-800 text-sm font-medium leading-normal pb-2" htmlFor="pnc">PNC (Cantidad o descripción breve, si aplica)</label>
                                <textarea
                                    className="form-textarea flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-lg text-slate-900 focus:outline-0 focus:ring-2 focus:ring-[#0c7ff2] border border-slate-300 bg-slate-50 focus:border-[#0c7ff2] placeholder:text-slate-400 p-3 text-sm font-normal leading-normal"
                                    id="pnc"
                                    name="pnc"
                                    placeholder="Ingrese cantidad o descripción"
                                    rows={3}
                                    value={pnc}
                                    onChange={(e) => setPnc(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="flex justify-end pt-4 gap-4">
                                <button type="button" onClick={onBack} className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-6 bg-white text-slate-700 ring-1 ring-slate-300 text-sm font-semibold leading-normal tracking-wide hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-colors">
                                    <span className="truncate">Cancelar</span>
                                </button>
                                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-11 px-6 bg-[#0c7ff2] text-slate-50 text-sm font-semibold leading-normal tracking-wide hover:bg-[#0a68c4] focus:outline-none focus:ring-2 focus:ring-[#0c7ff2] focus:ring-offset-2 focus:ring-offset-slate-50 transition-colors" type="submit">
                                    <span className="truncate">Guardar y Cerrar Tarea</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </>
    );
};

export default FinishTaskPage;