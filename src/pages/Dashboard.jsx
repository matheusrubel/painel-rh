import { useState } from 'react';
import { supabase } from '../config/supabase';
import TabelaCandidatos from '../components/TabelaCandidatos';
import ModalAdicionarCandidato from '../components/ModalAdicionarCandidato';
import NotificationBell from '../components/NotificationBell';
import ThemeToggle from '../components/ThemeToggle';
import GestaoVagas from './GestaoVagas';
import BancoTalentos from './BancoTalentos';
import KanbanCandidatos from '../components/KanbanCandidatos';
import DashboardAnalytics from './DashboardAnalytics';
import HistoricoCandidatos from './HistoricoCandidatos';

export default function Dashboard() {
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
      background: 'var(--gradient-primary)',
      color: 'var(--text-primary)'
    }}>
      {/* Header */}
      <header style={{
        background: 'var(--gradient-secondary)',
        padding: '20px 30px',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ 
            margin: 0, 
            fontSize: '24px',
            fontWeight: '700',
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)'
          }}>
            Michelc Assessoria Contábil
          </h1>
          <p style={{ 
            margin: '4px 0 0 0', 
            fontSize: '14px', 
            color: 'var(--text-tertiary)' 
          }}>
            Sistema ATS - Recrutamento & Seleção
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <ThemeToggle />
          <NotificationBell />
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.2)';
            }}
          >
            🚪 Sair
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        background: 'var(--bg-secondary)',
        backdropFilter: 'blur(10px)',
        padding: '15px 30px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        gap: '10px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'candidatos', label: '📋 Candidatos' },
          { id: 'pipeline', label: '🎯 Pipeline' },
          { id: 'vagas', label: '💼 Vagas' },
          { id: 'banco', label: '⭐ Banco de Talentos' },
          { id: 'historico', label: '📜 Histórico' },
          { id: 'analytics', label: '📊 Analytics' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setPaginaAtual(item.id)}
            style={{
              padding: '10px 20px',
              background: paginaAtual === item.id 
                ? 'var(--gradient-accent)' 
                : 'var(--bg-tertiary)',
              color: paginaAtual === item.id ? '#fff' : 'var(--text-secondary)',
              border: paginaAtual === item.id 
                ? 'none' 
                : '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              boxShadow: paginaAtual === item.id 
                ? 'var(--shadow-md)' 
                : 'none',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              if (paginaAtual !== item.id) {
                e.target.style.background = 'var(--bg-quaternary)';
              }
            }}
            onMouseLeave={(e) => {
              if (paginaAtual !== item.id) {
                e.target.style.background = 'var(--bg-tertiary)';
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main style={{ padding: '30px', maxWidth: '1600px', margin: '0 auto' }}>
        {paginaAtual === 'candidatos' && (
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ 
                color: 'var(--text-primary)', 
                margin: 0,
                fontSize: '22px',
                fontWeight: '700'
              }}>
                📋 Candidatos Novos
              </h2>
              <button
                onClick={() => setModalAberto(true)}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
              >
                ➕ Adicionar Candidato
              </button>
            </div>
            <TabelaCandidatos filtros={{}} setPaginaAtual={setPaginaAtual} key={recarregar} />
          </div>
        )}

        {paginaAtual === 'pipeline' && <KanbanCandidatos />}
        {paginaAtual === 'vagas' && <GestaoVagas />}
        {paginaAtual === 'banco' && <BancoTalentos />}
        {paginaAtual === 'historico' && <HistoricoCandidatos />}
        {paginaAtual === 'analytics' && <DashboardAnalytics />}
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