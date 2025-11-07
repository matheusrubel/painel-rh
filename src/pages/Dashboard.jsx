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
    <div style={{ minHeight: '100vh', background: '#0f172a' }}>
      {/* Navbar */}
      <nav style={{
        background: '#1e293b',
        borderBottom: '1px solid #334155',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '70px'
        }}>
          {/* Logo e Título */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}>
              <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.25rem' }}>M</span>
            </div>
            <div>
              <h1 style={{ color: '#f8fafc', fontSize: '1.125rem', fontWeight: 700 }}>
                Michelc
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                Dashboard RH
              </p>
            </div>
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setModalAberto(true)}
              style={{
                padding: '0.625rem 1.25rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Adicionar
            </button>

            <button
              onClick={handleLogout}
              style={{
                padding: '0.625rem 1.25rem',
                background: '#334155',
                color: '#f8fafc',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#334155';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Sair
            </button>
          </div>
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        animation: 'fadeIn 0.5s ease-out'
      }}>
        {/* Cabeçalho */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.875rem',
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: '0.5rem'
          }}>
            Gestão de Candidatos
          </h2>
          <p style={{ color: '#94a3b8' }}>
            Painel de Controle RH
          </p>
        </div>

        {/* Card Principal */}
        <div style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          padding: 0,
          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          overflow: 'hidden'
        }}>
          {/* Header do Card */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid #334155'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#f8fafc',
              marginBottom: '1rem'
            }}>
              Filtros
            </h3>
            <FiltroCandidatos filtros={filtros} setFiltros={setFiltros} />
          </div>

          {/* Tabela */}
          <TabelaCandidatos filtros={filtros} key={recarregar} />
        </div>
      </main>

      {/* Modal */}
      <ModalAdicionarCandidato 
        isOpen={modalAberto} 
        onClose={() => setModalAberto(false)}
        onCandidatoAdicionado={handleCandidatoAdicionado}
      />
    </div>
  );
}