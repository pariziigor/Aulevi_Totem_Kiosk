import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import Standby from './pages/Standby';
import MainMenu from './pages/MainMenu';
import LSFFlow from './pages/LSFFlow';
import CatalogFlow from './pages/CatalogFlow'; // Importação do novo componente

const GlobalLayout = ({ children }: { children: React.ReactNode }) => {
  useInactivityTimeout(60);
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
          
          {/* Rota dinâmica que captura CHALE ou BARRACAO e repassa ao CatalogFlow */}
          <Route path="/fluxo/:category" element={<CatalogFlow />} />
        </Routes>
      </GlobalLayout>
    </Router>
  );
}

export default App;