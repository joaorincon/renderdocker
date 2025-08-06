
import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: (username: string, pin: string) => void;
  loginError: string | null;
  isLoggingIn: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loginError, isLoggingIn }) => {
  const [user, setUser] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin(user, pin);
  };

  const togglePinVisibility = () => {
    setShowPin(!showPin);
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-xl">
      <div>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900">
          Inicio de Sesión
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Accede a tu cuenta
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="user"
            className="block text-sm font-medium text-slate-700"
          >
            Usuario
          </label>
          <div className="mt-1">
            <input
              id="user"
              name="user"
              type="text"
              autoComplete="username"
              required
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Ingresa tu nombre de usuario"
              className="form-input block w-full appearance-none rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm transition-colors"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="pin"
            className="block text-sm font-medium text-slate-700"
          >
            PIN/Código de Empleado
          </label>
          <div className="relative mt-1">
            <input
              id="pin"
              name="pin"
              type={showPin ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Ingresa tu PIN o código de empleado"
              className="form-input block w-full appearance-none rounded-md border border-slate-300 bg-slate-50 px-3 py-2.5 pr-10 text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm transition-colors"
            />
            <button
              type="button"
              onClick={togglePinVisibility}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              aria-label={showPin ? 'Ocultar PIN' : 'Mostrar PIN'}
            >
              <span className="material-icons cursor-pointer select-none text-xl text-slate-500 hover:text-slate-700">
                {showPin ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>
        </div>
        {loginError && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="material-icons text-red-400" aria-hidden="true">cancel</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{loginError}</p>
              </div>
            </div>
          </div>
        )}
        <div>
          <button
            type="submit"
            disabled={isLoggingIn}
            className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? 'Iniciando...' : 'Iniciar Sesión'}
          </button>
        </div>
      </form>
      <p className="mt-6 text-center text-xs text-slate-500">
        © 2025 Implameq. Planta de Dispositivos Médicos.
      </p>
    </div>
  );
};

export default LoginForm;
