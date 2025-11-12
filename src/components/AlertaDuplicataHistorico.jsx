import { useState } from 'react';

export default function AlertaDuplicataHistorico({ historico, onClose, onContinuar }) {
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);

  if (!historico || historico.length === 0) return null;

  const ultimoProcesso = historico[0];
  const temReprovacao = historico.some(h => h.status_final === 'reprovado');
  const temBancoTalentos = historico.some(h => h.status_final === 'banco_talentos');

  const getStatusColor = (status) => {
    const cores = {
      reprovado: '#ef4444',
      banco_talentos: '#f59e0b',
      desistiu: '#64748b',
      aprovado: '#10b981'
    };
    return cores[status] || '#3b82f6';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: '20px',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '85vh',
        overflowY: 'auto',
        border: temReprovacao ? '2px solid #ef4444' : '2px solid #f59e0b',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        animation: 'slideUp 0.3s ease'
      }}>
        {/* Ícone */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: temReprovacao ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '40px',
          animation: 'pulse 2s infinite'
        }}>
          {temReprovacao ? '⚠️' : '🔍'}
        </div>

        {/* Título */}
        <h2 style={{
          color: '#f8fafc',
          textAlign: 'center',
          marginBottom: '12px',
          fontSize: '24px',
          fontWeight: '700'
        }}>
          ⚠️ Candidato no Histórico!
        </h2>

        <p style={{
          color: '#94a3b8',
          textAlign: 'center',
          marginBottom: '24px',
          fontSize: '15px'
        }}>
          Este candidato possui <strong style={{ color: '#f59e0b' }}>{historico.length}</strong> registro{historico.length > 1 ? 's' : ''} em processos anteriores
        </p>

        {/* Alertas */}
        {temReprovacao && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '28px' }}>❌</span>
            <div>
              <strong style={{ color: '#fca5a5', display: 'block', fontSize: '14px' }}>
                Reprovado Anteriormente
              </strong>
              <span style={{ color: '#cbd5e1', fontSize: '13px' }}>
                Foi reprovado em {historico.filter(h => h.status_final === 'reprovado').length} processo{historico.filter(h => h.status_final === 'reprovado').length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {temBancoTalentos && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '28px' }}>⭐</span>
            <div>
              <strong style={{ color: '#fbbf24', display: 'block', fontSize: '14px' }}>
                Está no Banco de Talentos
              </strong>
              <span style={{ color: '#cbd5e1', fontSize: '13px' }}>
                Marcado como talento em processos anteriores
              </span>
            </div>
          </div>
        )}

        {/* Último Processo */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid #475569'
        }}>
          <h4 style={{ color: '#f8fafc', marginBottom: '12px', fontSize: '15px', fontWeight: '600' }}>
            📋 Último Processo
          </h4>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div>
              <div style={{ color: '#cbd5e1', fontSize: '13px' }}>
                {ultimoProcesso.cargo_pretendido}
              </div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>
                {new Date(ultimoProcesso.data_inscricao).toLocaleDateString('pt-BR')}
              </div>
            </div>
            <span style={{
              background: getStatusColor(ultimoProcesso.status_final),
              color: '#fff',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              height: 'fit-content'
            }}>
              {ultimoProcesso.status_final === 'reprovado' ? '❌' : ultimoProcesso.status_final === 'banco_talentos' ? '⭐' : '⏳'}
            </span>
          </div>

          {ultimoProcesso.observacoes && (
            <div style={{
              marginTop: '10px',
              padding: '10px',
              background: 'rgba(15, 23, 42, 0.4)',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#94a3b8'
            }}>
              "{ultimoProcesso.observacoes}"
            </div>
          )}
        </div>

        {/* Botão Ver Todos */}
        {historico.length > 1 && (
          <button
            onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
            style={{
              width: '100%',
              padding: '10px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              color: '#60a5fa',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '16px'
            }}
          >
            {mostrarDetalhes ? '▼ Ocultar' : '▶ Ver todos os registros'}
          </button>
        )}

        {/* Lista completa */}
        {mostrarDetalhes && historico.length > 1 && (
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            marginBottom: '20px',
            padding: '10px',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '8px'
          }}>
            {historico.slice(1).map((reg, index) => (
              <div key={index} style={{
                padding: '10px',
                borderBottom: index < historico.length - 2 ? '1px solid #334155' : 'none',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#cbd5e1', fontSize: '12px' }}>{reg.cargo_pretendido}</span>
                  <span style={{
                    background: getStatusColor(reg.status_final),
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    {reg.status_final}
                  </span>
                </div>
                <div style={{ color: '#64748b', fontSize: '11px' }}>
                  {new Date(reg.data_inscricao).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botões */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              background: 'rgba(71, 85, 105, 0.3)',
              color: '#f1f5f9',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            ❌ Cancelar
          </button>
          <button
            onClick={onContinuar}
            style={{
              flex: 1,
              padding: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
            }}
          >
            ✅ Continuar Mesmo Assim
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
