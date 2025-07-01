import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import useAuth from './hooks/useAuth.js';

// Layouts y Componentes de Rutas
import Layout from './components/Layout.jsx';
import RutaProtegida from './components/RutaProtegida.jsx';

// Páginas
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CajaDiaria from './pages/CajaDiaria.jsx';
import CierreDetalle from './pages/CierreDetalle.jsx';
import CuentasCorrientes from './pages/CuentasCorrientes.jsx';
import ClienteDetalle from './pages/ClienteDetalle.jsx';
import Retiros from './pages/Retiros.jsx';
import GestionUsuarios from './pages/GestionUsuarios.jsx';
import CierresZ from './pages/CierresZ.jsx';
import AxionOn from './pages/AxionOn.jsx';
// ================================================================
// ARCHIVO: src/App.jsx (Versión Final Completa)
//
// DESCRIPCIÓN:
// Orquesta toda la navegación de la aplicación usando React Router v6.
// Define qué rutas son públicas, cuáles son privadas y cuáles
// requieren permisos de administrador.
// ================================================================

/**
 * Componente de orden superior para proteger rutas que solo los
 * administradores pueden ver. Si el usuario no es admin, lo redirige
 * al dashboard principal.
 */
const RutaAdmin = ({ children }) => {
  const { auth } = useAuth();
  // Se usa el encadenamiento opcional `?.` por seguridad, aunque en este
  // punto `auth` ya debería estar definido.
  return auth?.rol === 'administrador' ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* --- RUTA PÚBLICA --- */}
          {/* El login es la única ruta accesible sin autenticación. */}
          <Route path="/" element={<Login />} />

          {/* --- RUTAS PRIVADAS --- */}
          {/* Todas las rutas dentro de este bloque requieren que el usuario esté logueado. */}
          {/* El componente RutaProtegida se encarga de esta validación. */}
          <Route element={<RutaProtegida />}>
            
            {/* El componente Layout provee la estructura visual (Sidebar, Header) */}
            {/* para todas las páginas internas. Las páginas se renderizan en su <Outlet /> */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/caja-diaria" element={<CajaDiaria />} />
              <Route path="/cierre/:id" element={<CierreDetalle />} />
              <Route path="/cierres" element={<CierresZ />} />
  <Route path="/axion-on" element={<AxionOn />} /> 
              <Route path="/cuentas-corrientes" element={<CuentasCorrientes />} />
              <Route path="/cuentas-corrientes/:id" element={<ClienteDetalle />} />
              <Route path="/adelantos" element={<Retiros />} />
              
              {/* Ruta especial que, además de ser privada, requiere ser administrador */}
              <Route
                path="/usuarios"
                element={
                  <RutaAdmin>
                    <GestionUsuarios />
                  </RutaAdmin>
                }
              />

              {/* Redirección por defecto: si un usuario logueado intenta acceder
                  a una ruta que no existe, lo mandamos al dashboard. */}
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Route>
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
