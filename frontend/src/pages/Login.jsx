import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { User, KeyRound, LoaderCircle } from 'lucide-react';

const Login = () => {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(dni, password);
      navigate('/');
    } catch (err) {
      setError('DNI o Contraseña incorrectos.');
      setIsLoading(false);
    }
  };
  
  const SurtidorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor: '#58A6FF', stopOpacity:1}} />
                <stop offset="100%" style={{stopColor: '#E9A8F9', stopOpacity:1}} />
            </linearGradient>
        </defs>
        <path stroke="url(#grad1)" d="M14 11h1.5a2.5 2.5 0 0 0 0-5h-11a2.5 2.5 0 0 0 0 5H4" />
        <line stroke="url(#grad1)" x1="14" y1="11" x2="14" y2="17" />
        <line stroke="url(#grad1)" x1="4" y1="11" x2="4" y2="17" />
        <path stroke="url(#grad1)" d="M14 17h-1a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h1" />
        <path stroke="url(#grad1)" d="M20 17h-5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h5" />
        <path stroke="url(#grad1)" d="M4 17H2v-2" />
        <path stroke="url(#grad1)" d="M12 6V4" />
        <path stroke="url(#grad1)" d="M12 2v2" />
    </svg>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-fondo p-4">
      <div className="w-full max-w-sm">
        <div className="bg-primario rounded-xl shadow-2xl p-8 border border-borde">
          <div className="flex flex-col items-center mb-8">
            <SurtidorIcon />
            <h1 className="text-3xl font-bold text-texto-principal mt-4">NaWeL</h1>
            <p className="text-texto-secundario mt-1">Control de Estación</p>
          </div>

          <form onSubmit={manejarSubmit} className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-texto-secundario" />
              <input
                type="number"
                placeholder="DNI"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-fondo border border-borde rounded-md focus:outline-none focus:ring-2 focus:ring-acento-1 text-texto-principal transition-all"
                required
              />
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-texto-secundario" />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-fondo border border-borde rounded-md focus:outline-none focus:ring-2 focus:ring-acento-1 text-texto-principal transition-all"
                required
              />
            </div>
            
            {error && <p className="text-red-500 text-sm text-center animate-pulse">{error}</p>}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 rounded-md shadow-sm font-medium text-white bg-gradient-to-r from-acento-1 to-acento-2 hover:from-acento-1/90 hover:to-acento-2/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-acento-2 focus:ring-offset-primario disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            >
              {isLoading ? <LoaderCircle className="animate-spin h-5 w-5" /> : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
