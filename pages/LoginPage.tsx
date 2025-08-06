
import React from 'react';
import Header from '../components/Header';
import LoginForm from '../components/LoginForm';

interface LoginPageProps {
  onLogin: (username: string, pin: string) => void;
  error: string | null;
  isLoggingIn: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, error, isLoggingIn }) => {
  return (
    <div className="layout-container flex h-full grow flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <LoginForm onLogin={onLogin} loginError={error} isLoggingIn={isLoggingIn} />
      </main>
    </div>
  );
};

export default LoginPage;
