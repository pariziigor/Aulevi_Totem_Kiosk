import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; 
import { MainMenu } from './pages/MainMenu'; // Certifique-se de que o nome do arquivo está correto

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota Raiz: Onde as opções devem aparecer */}
        <Route path="/" element={<MainMenu />} />
        
        {/* Exemplo de rota de fluxo (será expandida depois) */}
        <Route path="/fluxo/:id" element={<div className="p-20 text-4xl font-black">FLUXO EM DESENVOLVIMENTO</div>} />
      </Routes>
    </Router>
  );
}

export default App;