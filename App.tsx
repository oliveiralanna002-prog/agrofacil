import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './screens/Dashboard';
import Finance from './screens/Finance';
import Production from './screens/Production';
import Inventory from './screens/Inventory';
import Alerts from './screens/Alerts';
import { Screen } from './types';
import { initializeData } from './services/storage';

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<Screen>('DASHBOARD');

  useEffect(() => {
    initializeData();
  }, []);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'DASHBOARD':
        return <Dashboard />;
      case 'PRODUCTION':
        return <Production />;
      case 'FINANCE':
        return <Finance />;
      case 'INVENTORY':
        return <Inventory />;
      case 'ALERTS':
        return <Alerts />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeScreen={activeScreen} onNavigate={setActiveScreen}>
      {renderScreen()}
    </Layout>
  );
};

export default App;