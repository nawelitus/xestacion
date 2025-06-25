// Contenido COMPLETO y CORREGIDO para: src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RutaProtegida from './components/RutaProtegida';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CierreDetalle from './pages/CierreDetalle'; 
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* 1. RUTA PÚBLICA */}
          <Route path="/" element={<Login />} />

          {/* 2. GRUPO DE RUTAS PROTEGIDAS */}
          {/* RutaProtegida ahora envuelve a Layout, que a su vez envuelve a las páginas */}
          <Route element={<RutaProtegida />}>
            <Route path="/dashboard" element={<Layout />}>
              {/* Esta ruta (index) se renderizará en el <Outlet/> de Layout cuando la URL sea exactamente "/dashboard" */}
              <Route index element={<Dashboard />} />

              {/* Esta ruta se renderizará en el <Outlet/> de Layout cuando la URL sea "/dashboard/cierres/:id" */}
              <Route path="cierres/:id" element={<CierreDetalle />} />

              {/* Aquí puedes añadir futuras rutas que compartan el mismo Layout */}
              {/* <Route path="caja" element={<CajaDiaria />} /> */}
              {/* <Route path="cuentas-corrientes" element={<CuentasCorrientes />} /> */}
            </Route>
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;