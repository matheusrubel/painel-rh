import { useState } from 'react';
import { supabase } from '../config/supabase';
import TabelaCandidatos from '../components/TabelaCandidatos';
import FiltroCandidatos from '../components/FiltroCandidatos';
import ModalAdicionarCandidato from '../components/ModalAdicionarCandidato';

export default function Dashboard() {
  const [filtros, setFiltros] = useState({
    cargo: '',
    status: 'todos',
    bancoTalentos: null
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [recarregar, setRecarregar] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleCandidatoAdicionado = () => {
    setRecarregar(!recarregar);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
        <div>
          <h1>Gestão de Candidatos</h1>
          <p style={{ color: '#666' }}>Painel de Controle RH</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={() => setModalAberto(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            + Adicionar Candidato
          </button>
          <button 
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Sair
          </button>
        </div>
      </div>
      
      <FiltroCandidatos filtros={filtros} setFiltros={setFiltros} />
      <TabelaCandidatos filtros={filtros} key={recarregar} />
      
      <ModalAdicionarCandidato 
        isOpen={modalAberto} 
        onClose={() => setModalAberto(false)}
        onCandidatoAdicionado={handleCandidatoAdicionado}
      />
    </div>
  );
}
