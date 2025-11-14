import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { showError } from '../utils/toast';
import { handleError } from '../utils/errorHandler';

export default function HistoricoCandidatos() {
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');

  useEffect(() => {
    fetchHistorico();
  }, [filtroStatus]);

  const fetchHistorico = async () => {
    setCarregando(true);
    try {
      let query = supabase
        .from('historico_candidatos')
        .select('*')
        .order('data_inscricao', { ascending: false });

      if (filtroStatus !== 'todos') {
        query = query.eq('status_final', filtroStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      setHistorico(data || []);
    } catch (err) {
      handleError(err, 'Erro ao buscar histórico');
    } finally {
      setCarregando(false);
    }
  };

  const historicoFiltrado = historico.filter(item => {
    if (!busca) return true;
    const termo = busca.toLowerCase();
    return (
      item.nome_completo.toLowerCase().includes(termo) ||
      item.email?.toLowerCase().includes(termo) ||
      item.cargo_pretendido?.toLowerCase().includes(termo) ||
      item.telefone?.includes(termo)
    );
  });

  const getStatusBadge = (status) => {
    const configs = {
      reprovado: { cor: '#ef4444', icone: '❌', texto: 'Reprovado' },
      aprovado: { cor: '#10b981', icone: '✅', texto: 'Aprovado' },
      banco_talentos: { cor: '#f59e0b', icone: '⭐', texto: 'Banco de Talentos' },
      em_processo: { cor: '#3b82f6', icone: '⏳', texto: 'Em Processo' },
      desistiu: { cor: '#64748b', icone: '🚪', texto: 'Desistiu' }
    };

    const config = configs[status] || configs.em_processo;

    return (
      <span style={{
        background: config.cor,
        color: '#fff',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {config.icone} {config.texto}
      </span>
    );
  };

  if (carregando) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
        <div className="spinner" style={{ margin: '0 auto 15px' }} />
        <p>Carregando histórico...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{
        background: 'var(--gradient-secondary)',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '25px',
        border: '1px solid var(--border-color)'
      }}>
        <h2 style={{
          color: 'var(--text-primary)',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '24px'
        }}>
          📜 Histórico de Candidatos
        </h2>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', margin: 0 }}>
          {historico.length} registro{historico.length !== 1 ? 's' : ''} no histórico
        </p>
      </div>

      {/* Filtros */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <input
          type="text"
          placeholder="🔍 Buscar por nome, telefone, email..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{
            background: 'var(--input-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--input-border)',
            padding: '12px 15px',
            borderRadius: '8px',
            minWidth: '300px',
            flex: 1,
            fontSize: '14px'
          }}
        />

        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          style={{
            background: 'var(--input-bg)',
            color: 'var(--text-primary)',
            border: '1px solid var(--input-border)',
            padding: '12px 15px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <option value="todos">📊 Todos os Status</option>
          <option value="em_processo">⏳ Em Processo</option>
          <option value="aprovado">✅ Aprovado</option>
          <option value="reprovado">❌ Reprovado</option>
          <option value="banco_talentos">⭐ Banco de Talentos</option>
          <option value="desistiu">🚪 Desistiu</option>
        </select>
      </div>

      {/* Lista */}
      {historicoFiltrado.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'var(--gradient-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔭</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>
            Nenhum registro encontrado
          </h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {historicoFiltrado.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'var(--gradient-secondary)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                    fontSize: '18px',
                    fontWeight: '600'
                  }}>
                    {item.nome_completo}
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                    {item.telefone && (
                      <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', margin: 0 }}>
                        📱 {item.telefone}
                      </p>
                    )}
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', margin: 0 }}>
                      💼 {item.cargo_pretendido}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {getStatusBadge(item.status_final)}
                    {item.score && (
                      <span style={{
                        background: item.score >= 7 ? '#10b981' : item.score >= 5 ? '#f59e0b' : '#ef4444',
                        color: '#fff',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        ⭐ Score: {item.score}/10
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-quaternary)' }}>
                    📅 {new Date(item.data_inscricao).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>

              {item.observacoes && (
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#fca5a5'
                }}>
                  <strong>📝 Observações:</strong> {item.observacoes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}