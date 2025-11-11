import { useState } from 'react';
import { supabase } from '../config/supabase';
import TabelaCandidatos from '../components/TabelaCandidatos';
import FiltroCandidatos from '../components/FiltroCandidatos';
import ModalAdicionarCandidato from '../components/ModalAdicionarCandidato';
import NotificationBell from '../components/NotificationBell';
import GestaoVagas from './GestaoVagas';
import BancoTalentos from './BancoTalentos';
import KanbanCandidatos from '../components/KanbanCandidatos';
import DashboardAnalytics from './DashboardAnalytics';

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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #0a0f1e 100%)'
    }}>
      {/* Header Global */}
      <div style={{
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        padding: '15px 30px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Logo/Título */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '20px',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 'bold'
              }}>
                Sistema ATS
              </h1>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>
                Michelc Assessoria Contábil
              </p>
            </div>
          </div>

          {/* Ações do Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {/* Notificações */}
            <NotificationBell />

            {/* Botão Logout */}
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#dc2626';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#ef4444';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px' }}>
        {/* Menu de Navegação - 5 ABAS */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '30px',
          borderBottom: '2px solid #334155',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}>
          <TabButton
            ativo={paginaAtual === 'candidatos'}
            onClick={() => setPaginaAtual('candidatos')}
            icone="📋"
            texto="Candidatos"
          />
          <TabButton
            ativo={paginaAtual === 'pipeline'}
            onClick={() => setPaginaAtual('pipeline')}
            icone="🎯"
            texto="Pipeline"
          />
          <TabButton
            ativo={paginaAtual === 'vagas'}
            onClick={() => setPaginaAtual('vagas')}
            icone="💼"
            texto="Vagas"
          />
          <TabButton
            ativo={paginaAtual === 'talentos'}
            onClick={() => setPaginaAtual('talentos')}
            icone="⭐"
            texto="Talentos"
          />
          <TabButton
            ativo={paginaAtual === 'analytics'}
            onClick={() => setPaginaAtual('analytics')}
            icone="📊"
            texto="Analytics"
          />
        </div>

        {/* Conteúdo das Abas */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px solid #334155',
          minHeight: '600px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {paginaAtual === 'candidatos' && (
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <button
                  onClick={() => setModalAberto(true)}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                    transition: 'all 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                  }}
                >
                  <span style={{ fontSize: '18px' }}>+</span> Adicionar Candidato
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
            </div>
          )}

          {paginaAtual === 'pipeline' && <KanbanCandidatos />}

          {paginaAtual === 'vagas' && <GestaoVagas />}

          {paginaAtual === 'talentos' && <BancoTalentos />}

          {paginaAtual === 'analytics' && <DashboardAnalytics />}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '20px',
        color: '#64748b',
        fontSize: '12px'
      }}>
        <p style={{ margin: 0 }}>
          © 2025 Michelc Assessoria Contábil | Desenvolvido por SIDA
        </p>
      </div>

      {/* Animações */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// Componente de Botão de Tab
function TabButton({ ativo, onClick, icone, texto }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '12px 20px',
        backgroundColor: ativo ? '#f59e0b' : 'transparent',
        color: ativo ? 'white' : '#94a3b8',
        border: 'none',
        borderBottom: ativo ? '3px solid #f59e0b' : '3px solid transparent',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        transition: 'all 0.3s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        whiteSpace: 'nowrap',
        borderRadius: '8px 8px 0 0'
      }}
      onMouseEnter={(e) => {
        if (!ativo) {
          e.target.style.backgroundColor = '#334155';
          e.target.style.color = '#f8fafc';
        }
      }}
      onMouseLeave={(e) => {
        if (!ativo) {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = '#94a3b8';
        }
      }}
    >
      <span style={{ fontSize: '16px' }}>{icone}</span>
      {texto}
    </button>
  );
}