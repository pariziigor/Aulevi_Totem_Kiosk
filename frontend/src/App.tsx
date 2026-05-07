import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainMenu } from './pages/MainMenu';
import LSFFlow from './pages/LSFFlow';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        {/* Substituímos a rota genérica pela rota dedicada do LSF */}
        <Route path="/fluxo/LSF" element={<LSFFlow />} />
        <Route path="/fluxo/:id" element={<div className="p-20 text-4xl font-black flex justify-center items-center h-screen bg-white text-black border-16 border-black">MÓDULO EM DESENVOLVIMENTO</div>} />
      </Routes>
    </Router>
  );
}

export default App;