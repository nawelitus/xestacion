// Contenido COMPLETO y ACTUALIZADO para: src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RutaProtegida from './components/RutaProtegida';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CierreDetalle from './pages/CierreDetalle'; 
import { AuthProvider } from './context/AuthContext';
import CajaDiaria from './pages/CajaDiaria';

// --- AÑADIR IMPORTS DE LAS NUEVAS PÁGINAS ---
import CuentasCorrientes from './pages/CuentasCorrientes';
import ClienteDetalle from './pages/ClienteDetalle';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 1. RUTA PÚBLICA */}
          <Route path="/" element={<Login />} />

          {/* 2. GRUPO DE RUTAS PROTEGIDAS */}
          <Route element={<RutaProtegida />}>
            <Route path="/dashboard" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="cierres/:id" element={<CierreDetalle />} />
              
              {/* --- AÑADIR NUEVAS RUTAS DE CUENTAS CORRIENTES --- */}
              <Route path="cuentas-corrientes" element={<CuentasCorrientes />} />
              <Route path="cuentas-corrientes/:id" element={<ClienteDetalle />} />
              <Route path="caja" element={<CajaDiaria />} />

            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;