import { useState } from 'react';
import LandingPage from './LandingPage';
import Dashboard from './Dashboard';

function App() {
  const [view, setView] = useState('landing'); // landing | dashboard

  return (
    <div className="min-h-screen bg-[#0a0a0c]">
      {view === 'landing' ? (
        <LandingPage onEnter={() => setView('dashboard')} />
      ) : (
        <Dashboard onLogout={() => setView('landing')} />
      )}
    </div>
  );
}

export default App;
