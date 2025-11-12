import { useState } from 'react';
import { supabase } from '../config/supabase';
import TabelaCandidatos from '../components/TabelaCandidatos';
import ModalAdicionarCandidato from '../components/ModalAdicionarCandidato';
import NotificationBell from '../components/NotificationBell';
import GestaoVagas from './GestaoVagas';
import BancoTalentos from './BancoTalentos';
import KanbanCandidatos from '../components/KanbanCandidatos';
import DashboardAnalytics from './DashboardAnalytics';

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
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#f8fafc'
    }}>
      {/* Header */}
      <header style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        padding: '20px 30px',
        borderBottom: '1px solid #334155',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
          }}>
            🎯
          </div>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '24px',
              fontWeight: '700',
              letterSpacing: '-0.02em'
            }}>
              Michelc Assessoria Contábil
            </h1>
            <p style={{ 
              margin: '4px 0 0 0', 
              fontSize: '14px', 
              color: '#94a3b8' 
            }}>
              Sistema ATS - Recrutamento & Seleção
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.3)';
              e.target.style.color = '#fee2e2';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(239, 68, 68, 0.2)';
              e.target.style.color = '#fca5a5';
            }}
          >
            🚪 Sair
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        background: 'rgba(30, 41, 59, 0.5)',
        backdropFilter: 'blur(10px)',
        padding: '15px 30px',
        borderBottom: '1px solid rgba(51, 65, 85, 0.6)',
        display: 'flex',
        gap: '10px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'candidatos', label: '📋 Candidatos', icon: '📋' },
          { id: 'pipeline', label: '🎯 Pipeline', icon: '🎯' },
          { id: 'vagas', label: '💼 Vagas', icon: '💼' },
          { id: 'banco', label: '⭐ Banco de Talentos', icon: '⭐' },
          { id: 'analytics', label: '📊 Analytics', icon: '📊' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setPaginaAtual(item.id)}
            style={{
              padding: '10px 20px',
              background: paginaAtual === item.id 
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                : 'rgba(51, 65, 85, 0.3)',
              color: paginaAtual === item.id ? '#fff' : '#cbd5e1',
              border: paginaAtual === item.id 
                ? 'none' 
                : '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              boxShadow: paginaAtual === item.id 
                ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
                : 'none'
            }}
            onMouseEnter={(e) => {
              if (paginaAtual !== item.id) {
                e.target.style.background = 'rgba(51, 65, 85, 0.5)';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (paginaAtual !== item.id) {
                e.target.style.background = 'rgba(51, 65, 85, 0.3)';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main style={{ padding: '30px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Botão Adicionar Candidato - Apenas na aba Candidatos */}
        {paginaAtual === 'candidatos' && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h2 style={{ 
              color: '#f8fafc', 
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
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
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
              ➕ Adicionar Candidato
            </button>
          </div>
        )}

        {/* Páginas */}
        {paginaAtual === 'candidatos' && (
          <TabelaCandidatos 
            filtros={{}} 
            setPaginaAtual={setPaginaAtual} 
            key={recarregar} 
          />
        )}

        {paginaAtual === 'pipeline' && <KanbanCandidatos />}

        {paginaAtual === 'vagas' && <GestaoVagas />}

        {paginaAtual === 'banco' && <BancoTalentos />}

        {paginaAtual === 'analytics' && <DashboardAnalytics />}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: '40px',
        padding: '20px 30px',
        borderTop: '1px solid rgba(51, 65, 85, 0.6)',
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(10px)',
        textAlign: 'center'
      }}>
        <p style={{ 
          color: '#64748b', 
          margin: 0, 
          fontSize: '14px' 
        }}>
          © 2025 Michelc Assessoria Contábil | Desenvolvido por SIDA
        </p>
      </footer>

      {/* Modal Adicionar Candidato */}
      <ModalAdicionarCandidato
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onCandidatoAdicionado={handleCandidatoAdicionado}
      />
    </div>
  );
}
