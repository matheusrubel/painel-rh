import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { showSuccess, showError } from '../utils/toast';
import { handleError } from '../utils/errorHandler';
import { useHistoricoCandidato } from '../hooks/useHistoricoCandidato';
import BadgeHistorico from './BadgeHistorico';

export default function TabelaCandidatos({ filtros, setPaginaAtual }) {
  const [candidatos, setCandidatos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  // ✅ Estados de histórico
  const { verificarDuplicata } = useHistoricoCandidato();
  const [historicosPorCandidato, setHistoricosPorCandidato] = useState({});
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(null);

  useEffect(() => {
    fetchCandidatos();

    const channel = supabase
      .channel('candidatos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'candidatos' }, () => fetchCandidatos())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'etapas_candidato' }, () => fetchCandidatos())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filtros]);

  // ✅ useEffect para verificar histórico
  useEffect(() => {
    async function verificarTodosHistoricos() {
      if (!candidatos || candidatos.length === 0) return;
      
      const historicos = {};
      
      for (const candidato of candidatos) {
        try {
          const resultado = await verificarDuplicata(
            candidato.nome_completo,
            candidato.telefone,
            candidato.cpf
          );
          
          if (resultado.isDuplicata) {
            historicos[candidato.id] = resultado;
          }
        } catch (err) {
          console.error('Erro ao verificar histórico:', err);
        }
      }
      
      setHistoricosPorCandidato(historicos);
    }
    
    verificarTodosHistoricos();
  }, [candidatos]);

  const fetchCandidatos = async () => {
    setCarregando(true);
    try {
      let query = supabase
        .from('candidatos')
        .select('*')
        .order('criado_em', { ascending: false });

      query = query.or('etapa_atual.is.null,etapa_atual.eq.triagem');

      if (filtros?.cargo) {
        query = query.ilike('cargo_pretendido', `%${filtros.cargo}%`);
      }

      query = query.or('banco_talentos.is.null,banco_talentos.eq.false');

      const { data, error } = await query;

      if (error) throw error;

      setCandidatos(data || []);
    } catch (err) {
      handleError(err, 'Erro ao buscar candidatos');
    } finally {
      setCarregando(false);
    }
  };

  const handleMoveToBancoTalentos = async (candidatoId) => {
    if (!window.confirm('Mover este candidato para o Banco de Talentos?')) return;

    try {
      const { error } = await supabase
        .from('candidatos')
        .update({ banco_talentos: true })
        .eq('id', candidatoId);

      if (error) throw error;

      showSuccess('✅ Candidato movido para o Banco de Talentos!');
      fetchCandidatos();
    } catch (err) {
      handleError(err, 'Erro ao mover candidato');
    }
  };

  const handleDeleteCandidato = async (candidatoId) => {
    if (!window.confirm('⚠️ Tem certeza que deseja excluir este candidato permanentemente?')) return;

    try {
      const { error } = await supabase
        .from('candidatos')
        .delete()
        .eq('id', candidatoId);

      if (error) throw error;

      showSuccess('🗑️ Candidato excluído com sucesso!');
      fetchCandidatos();
    } catch (err) {
      handleError(err, 'Erro ao excluir candidato');
    }
  };

  const handleIniciarProcesso = async (candidatoId) => {
    try {
      const { error: etapaError } = await supabase
        .from('etapas_candidato')
        .insert({
          candidato_id: candidatoId,
          etapa: 'triagem',
          status: 'em_andamento'
        });

      if (etapaError) throw etapaError;

      const { error: updateError } = await supabase
        .from('candidatos')
        .update({ etapa_atual: 'triagem' })
        .eq('id', candidatoId);

      if (updateError) throw updateError;

      showSuccess('🚀 Processo iniciado! Candidato movido para Pipeline');

      if (setPaginaAtual) {
        setPaginaAtual('pipeline');
      }
    } catch (err) {
      handleError(err, 'Erro ao iniciar processo');
    }
  };

  const handleVerHistorico = (historicoInfo) => {
    setModalHistoricoAberto(historicoInfo);
  };

  if (carregando) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
        Carregando candidatos...
      </div>
    );
  }

  if (candidatos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
        <p style={{ fontSize: '16px', margin: 0 }}>
          {filtros?.cargo ? `Nenhum candidato encontrado para "${filtros.cargo}"` : 'Todos os candidatos estão em processo no Pipeline'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          background: '#1e293b',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <thead>
            <tr style={{ background: '#334155' }}>
              <th style={{ padding: '16px', textAlign: 'left', color: '#f8fafc', fontWeight: '700' }}>Nome</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#f8fafc', fontWeight: '700' }}>E-mail</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#f8fafc', fontWeight: '700' }}>Cargo</th>
              <th style={{ padding: '16px', textAlign: 'center', color: '#f8fafc', fontWeight: '700' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'center', color: '#f8fafc', fontWeight: '700' }}>Data</th>
              <th style={{ padding: '16px', textAlign: 'center', color: '#f8fafc', fontWeight: '700' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {candidatos.map((candidato) => (
              <tr key={candidato.id} style={{
                borderBottom: '1px solid #334155',
                transition: 'background 0.2s'
              }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#f8fafc', fontWeight: '600' }}>
                      {candidato.nome_completo}
                    </span>
                    
                    {historicosPorCandidato[candidato.id] && (
                      <div onClick={() => handleVerHistorico(historicosPorCandidato[candidato.id])}>
                        <BadgeHistorico
                          tipo={
                            historicosPorCandidato[candidato.id].flags.reprovado 
                              ? 'reprovado' 
                              : 'banco_talentos'
                          }
                          count={historicosPorCandidato[candidato.id].historico.length}
                          onClick={() => {}}
                        />
                      </div>
                    )}
                  </div>
                </td>
                <td style={{ padding: '16px', color: '#94a3b8' }}>{candidato.Email}</td>
                <td style={{ padding: '16px', color: '#cbd5e1' }}>{candidato.cargo_pretendido}</td>
                <td style={{ padding: '16px', textAlign: 'center' }}>
                  <span style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    📋 Novo
                  </span>
                </td>
                <td style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  {new Date(candidato.criado_em).toLocaleDateString('pt-BR')}
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {candidato.curriculo_url && (
                      <button
                        onClick={() => window.open(candidato.curriculo_url, '_blank')}
                        style={{
                          background: '#6366f1',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          transition: 'all 0.2s'
                        }}
                        title="Ver Currículo"
                      >
                        📄 CV
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleIniciarProcesso(candidato.id)}
                      style={{
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                      title="Iniciar Processo"
                    >
                      ▶️ Iniciar
                    </button>
                    
                    <button
                      onClick={() => handleMoveToBancoTalentos(candidato.id)}
                      style={{
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                      title="Banco de Talentos"
                    >
                      ⭐ Banco
                    </button>
                    
                    <button
                      onClick={() => handleDeleteCandidato(candidato.id)}
                      style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ POPUP DE HISTÓRICO */}
      {modalHistoricoAberto && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#1e293b',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          border: '1px solid #475569',
          zIndex: 9999,
          minWidth: '450px',
          maxWidth: '600px',
          maxHeight: '70vh',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              📜 Histórico Completo
            </h3>
            <button
              onClick={() => setModalHistoricoAberto(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                fontSize: '24px',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1
              }}
            >
              ×
            </button>
          </div>

          {modalHistoricoAberto.historico.map((item, idx) => (
            <div key={idx} style={{
              background: '#334155',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '12px',
              borderLeft: `4px solid ${item.status_final === 'reprovado' ? '#ef4444' : '#f59e0b'}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ 
                  color: item.status_final === 'reprovado' ? '#ef4444' : '#f59e0b', 
                  fontWeight: '700', 
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {item.status_final === 'reprovado' ? '❌ Reprovado' : '⭐ Banco de Talentos'}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                  {new Date(item.data_inscricao || item.criado_em).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {item.cargo_pretendido && (
                <p style={{ color: '#cbd5e1', margin: '0 0 8px 0', fontSize: '13px' }}>
                  💼 <strong>Cargo:</strong> {item.cargo_pretendido}
                </p>
              )}

              {item.etapa_final && (
                <p style={{ color: '#cbd5e1', margin: '0 0 8px 0', fontSize: '13px' }}>
                  🎯 <strong>Etapa Alcançada:</strong> {item.etapa_final}
                </p>
              )}

              {item.score && (
                <p style={{ color: '#cbd5e1', margin: '0 0 8px 0', fontSize: '13px' }}>
                  ⭐ <strong>Pontuação:</strong> {item.score}/100
                </p>
              )}

              {item.motivo_reprovacao && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                  borderLeft: '3px solid ' + (item.status_final === 'reprovado' ? '#ef4444' : '#f59e0b')
                }}>
                  <p style={{ 
                    color: '#64748b', 
                    margin: '0 0 4px 0', 
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    fontWeight: '700'
                  }}>
                    {item.status_final === 'reprovado' ? '🚫 Motivo da Reprovação:' : '📝 Motivo:'}
                  </p>
                  <p style={{
                    color: '#e2e8f0',
                    margin: 0,
                    fontSize: '13px',
                    fontStyle: 'italic',
                    lineHeight: '1.6'
                  }}>
                    "{item.motivo_reprovacao}"
                  </p>
                </div>
              )}


              {item.pontos_fortes && item.pontos_fortes.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <p style={{ color: '#10b981', fontSize: '12px', margin: '4px 0', fontWeight: '600' }}>
                    ✅ Pontos Fortes: {item.pontos_fortes.join(', ')}
                  </p>
                </div>
              )}
              {item.pontos_fracos && item.pontos_fracos.length > 0 && (
                <div style={{ marginTop: '4px' }}>
                  <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0', fontWeight: '600' }}>
                    ⚠️ Pontos de Melhoria: {item.pontos_fracos.join(', ')}
                  </p>
                </div>
              )}
            </div>
          ))}

          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#60a5fa', margin: 0, fontSize: '13px', fontWeight: '600' }}>
              📊 Total: {modalHistoricoAberto.historico.length} {modalHistoricoAberto.historico.length === 1 ? 'registro' : 'registros'}
            </p>
          </div>
        </div>
      )}

      {modalHistoricoAberto && (
        <div
          onClick={() => setModalHistoricoAberto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 9998
          }}
        />
      )}
    </>
  );
}
