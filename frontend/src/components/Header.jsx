import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ onMenuClick }) => {
  return (
    <header className="bg-primario p-4 md:hidden">
      <button onClick={onMenuClick} className="text-texto-principal">
        <Menu size={24} />
      </button>
    </header>
  );
};

export default Header;