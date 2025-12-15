import React from 'react';
import { LayoutDashboard, Sprout, DollarSign, Package, Bell } from 'lucide-react';
import { Screen } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeScreen, onNavigate }) => {
  
  const navItems = [
    { id: 'DASHBOARD', label: 'Início', icon: LayoutDashboard },
    { id: 'PRODUCTION', label: 'Produção', icon: Sprout },
    { id: 'FINANCE', label: 'Finanças', icon: DollarSign },
    { id: 'INVENTORY', label: 'Estoque', icon: Package },
    { id: 'ALERTS', label: 'Alertas', icon: Bell },
  ] as const;

  return (
    <div className="flex flex-col h-screen bg-soil-100 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-agro-800 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          <div>
            <h1 className="text-xl font-bold tracking-wide">AgroFácil</h1>
            <p className="text-xs text-agro-200">Gestão Rural Simplificada</p>
          </div>
          <div className="h-8 w-8 bg-agro-600 rounded-full flex items-center justify-center text-sm font-bold border-2 border-agro-200">
            F
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        <div className="max-w-3xl mx-auto p-4 space-y-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20 pb-safe">
        <div className="flex justify-around items-center h-16 max-w-3xl mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as Screen)}
                className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                  isActive ? 'text-agro-700' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'block' : 'hidden sm:block'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;