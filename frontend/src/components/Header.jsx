import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  return (
    <header className="bg-primario p-4 md:hidden">
      {/* Este botón solo será visible en pantallas pequeñas (md:hidden) */}
      <button onClick={onMenuClick} className="text-texto-principal">
        <Menu size={24} />
      </button>
    </header>
  );
};

export default Header;