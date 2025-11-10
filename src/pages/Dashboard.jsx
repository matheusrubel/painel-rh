import { useState } from 'react';
import { supabase } from '../config/supabase';
import TabelaCandidatos from '../components/TabelaCandidatos';
import FiltroCandidatos from '../components/FiltroCandidatos';
import ModalAdicionarCandidato from '../components/ModalAdicionarCandidato';
import GestaoVagas from './GestaoVagas';
import BancoTalentos from './BancoTalentos';

export default function Dashboard() {
  const [filtros, setFiltros] = useState({
    cargo: '',
    status: 'todos',
    bancoTalentos: null
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [recarregar, setRecarregar] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState('candidatos');

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
          <h1>Gestão de RH</h1>
          <p style={{ color: '#666' }}>Painel de Controle</p>
        </div>
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

      {/* Menu de Navegação - 3 ABAS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #ddd' }}>
        <button
          onClick={() => setPaginaAtual('candidatos')}
          style={{
            padding: '10px 20px',
            backgroundColor: paginaAtual === 'candidatos' ? '#28a745' : 'transparent',
            color: paginaAtual === 'candidatos' ? 'white' : '#888',
            border: 'none',
            borderBottom: paginaAtual === 'candidatos' ? '3px solid #28a745' : 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Candidatos
        </button>
        <button
          onClick={() => setPaginaAtual('vagas')}
          style={{
            padding: '10px 20px',
            backgroundColor: paginaAtual === 'vagas' ? '#28a745' : 'transparent',
            color: paginaAtual === 'vagas' ? 'white' : '#888',
            border: 'none',
            borderBottom: paginaAtual === 'vagas' ? '3px solid #28a745' : 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Vagas
        </button>
        <button
          onClick={() => setPaginaAtual('talentos')}
          style={{
            padding: '10px 20px',
            backgroundColor: paginaAtual === 'talentos' ? '#28a745' : 'transparent',
            color: paginaAtual === 'talentos' ? 'white' : '#888',
            border: 'none',
            borderBottom: paginaAtual === 'talentos' ? '3px solid #28a745' : 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          ⭐ Banco de Talentos
        </button>
      </div>

      {/* Conteúdo */}
      {paginaAtual === 'candidatos' && (
        <>
          <div style={{ marginBottom: '20px' }}>
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
          </div>
          <FiltroCandidatos filtros={filtros} setFiltros={setFiltros} />
          <TabelaCandidatos 
            filtros={filtros} 
            setPaginaAtual={setPaginaAtual}
            key={recarregar} 
          />
          <ModalAdicionarCandidato
            isOpen={modalAberto}
            onClose={() => setModalAberto(false)}
            onCandidatoAdicionado={handleCandidatoAdicionado}
          />
        </>
      )}

      {paginaAtual === 'vagas' && <GestaoVagas />}
      
      {paginaAtual === 'talentos' && <BancoTalentos />}
    </div>
  );
}
