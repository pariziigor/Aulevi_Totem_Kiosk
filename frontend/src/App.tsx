import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import Standby from './pages/Standby';
import MainMenu from './pages/MainMenu';
import LSFFlow from './pages/LSFFlow';

// Componente Wrapper para injetar hooks globais dentro do Router
const GlobalLayout = ({ children }: { children: React.ReactNode }) => {
  useInactivityTimeout(60); // 60 segundos de inatividade reseta o totem
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <GlobalLayout>
        <Routes>
          <Route path="/standby" element={<Standby />} />
          <Route path="/" element={<MainMenu />} />
          <Route path="/fluxo/LSF" element={<LSFFlow />} />
          <Route path="/fluxo/:id" element={
            <div className="flex justify-center items-center h-screen w-screen bg-white text-black border-16 border-black text-6xl font-black uppercase">
              Módulo em Desenvolvimento
            </div>
          } />
        </Routes>
      </GlobalLayout>
    </Router>
  );
}

export default App;