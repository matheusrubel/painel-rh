import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { showSuccess, showError } from '../utils/toast';
import { handleError } from '../utils/errorHandler';
import { useTheme } from '../contexts/ThemeContext';

export default function TabelaCandidatos({ filtros, setPaginaAtual }) {
  const { colors } = useTheme();
  const [candidatos, setCandidatos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [candidatoExpandido, setCandidatoExpandido] = useState(null);
  const [historicosPorCandidato, setHistoricosPorCandidato] = useState({});
  const [mostrarHistorico, setMostrarHistorico] = useState(null);

  useEffect(() => {
    fetchCandidatos();
    
    const channel = supabase
      .channel('candidatos-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'candidatos' 
      }, () => fetchCandidatos())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filtros]);

  const fetchCandidatos = async () => {
    setCarregando(true);
    try {
      let query = supabase
        .from('candidatos')
        .select('*')
        .or('etapa_processo.is.null,etapa_processo.eq.triagem')
        .or('banco_talentos.is.null,banco_talentos.eq.false');
      
      if (filtros.cargo) {
        query = query.ilike('cargo_pretendido', `%${filtros.cargo}%`);
      }

      const { data, error } = await query.order('criado_em', { ascending: false });
      
      if (error) throw error;
      setCandidatos(data || []);
      
      // ✅ CORRIGIDO: Verificar histórico por CPF (mais confiável)
      if (data) {
        const historicosTemp = {};
        
        for (const candidato of data) {
          // Se tem CPF, busca por CPF. Senão, busca por nome
          let historicos = null;
          
          if (candidato.cpf) {
            const { data: hist } = await supabase
              .from('historico_candidatos')
              .select('*')
              .eq('cpf', candidato.cpf)
              .order('data_inscricao', { ascending: false });
            historicos = hist;
          } else {
            // Fallback: busca por nome se não tiver CPF
            const { data: hist } = await supabase
              .from('historico_candidatos')
              .select('*')
              .ilike('nome_completo', `%${candidato.nome_completo}%`)
              .order('data_inscricao', { ascending: false });
            historicos = hist;
          }
          
          if (historicos && historicos.length > 0) {
            historicosTemp[candidato.id] = historicos;
          }
        }
        
        setHistoricosPorCandidato(historicosTemp);
      }
    } catch (err) {
      handleError(err, 'Erro ao buscar candidatos');
    }
    setCarregando(false);
  };

  const iniciarProcesso = async (candidato) => {
    try {
      const { error } = await supabase
        .from('candidatos')
        .update({ etapa_processo: 'triagem' })
        .eq('id', candidato.id);
      
      if (error) throw error;
      
      showSuccess('Candidato movido para o Pipeline!');
      fetchCandidatos();
      
      setTimeout(() => {
        if (setPaginaAtual) setPaginaAtual('pipeline');
      }, 500);
    } catch (err) {
      handleError(err, 'Erro ao iniciar processo');
    }
  };

  const adicionarAoBanco = async (candidato) => {
    try {
      const { error } = await supabase
        .from('candidatos')
        .update({ banco_talentos: true })
        .eq('id', candidato.id);
      
      if (error) throw error;
      
      showSuccess('Candidato adicionado ao Banco de Talentos!');
      fetchCandidatos();
      
      setTimeout(() => {
        if (setPaginaAtual) setPaginaAtual('talentos');
      }, 500);
    } catch (err) {
      handleError(err, 'Erro ao adicionar ao banco');
    }
  };

  const deletarCandidato = async (id) => {
    if (!window.confirm('Deseja realmente deletar este candidato?')) return;
    
    try {
      const { error } = await supabase
        .from('candidatos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      showSuccess('Candidato deletado com sucesso!');
      fetchCandidatos();
    } catch (err) {
      handleError(err, 'Erro ao deletar candidato');
    }
  };

  const downloadCurriculo = (url) => {
    if (!url) {
      showError('Currículo não disponível');
      return;
    }
    window.open(url, '_blank');
  };

  const toggleExpand = (id) => {
    setCandidatoExpandido(candidatoExpandido === id ? null : id);
  };

  const formatarData = (data) => {
    if (!data) return 'N/A';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  if (carregando) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: colors.text.tertiary }}>
        <div className="spinner"></div>
        <p>Carregando candidatos...</p>
      </div>
    );
  }

  if (candidatos.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: colors.text.muted }}>
        <p style={{ fontSize: '18px', marginBottom: '10px' }}>📋 Nenhum candidato encontrado</p>
        <p style={{ fontSize: '14px' }}>Aguardando novos candidatos do site</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ marginBottom: '15px', color: colors.text.tertiary, fontSize: '14px' }}>
        {candidatos.length} candidato(s) encontrado(s)
      </div>

      <div style={{ 
        backgroundColor: colors.bg.secondary,
        borderRadius: '12px',
        overflow: 'hidden',
        border: `1px solid ${colors.border.primary}`,
        boxShadow: colors.shadow.sm
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 2.5fr',
          gap: '15px',
          padding: '15px 20px',
          backgroundColor: colors.bg.tertiary,
          fontWeight: 'bold',
          fontSize: '13px',
          color: colors.text.secondary,
          borderBottom: `1px solid ${colors.border.primary}`
        }}>
          <div>Nome</div>
          <div>E-mail</div>
          <div>Cargo</div>
          <div>Status</div>
          <div>Data</div>
          <div style={{ textAlign: 'center' }}>Ações</div>
        </div>

        {candidatos.map(candidato => (
          <div key={candidato.id}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1.5fr 1fr 1fr 2.5fr',
              gap: '15px',
              padding: '15px 20px',
              backgroundColor: candidatoExpandido === candidato.id ? colors.bg.tertiary : 'transparent',
              borderBottom: `1px solid ${colors.border.secondary}`,
              transition: 'background-color 0.2s',
              cursor: 'pointer'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '8px',
                color: colors.text.primary,
                fontSize: '14px'
              }}>
                <span onClick={() => toggleExpand(candidato.id)}>
                  {candidato.nome_completo}
                </span>
                {historicosPorCandidato[candidato.id] && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setMostrarHistorico(candidato.id);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: '#ffffff',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 6px rgba(245, 158, 11, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.1)';
                      e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = '0 2px 6px rgba(245, 158, 11, 0.3)';
                    }}
                    title="Clique para ver histórico completo"
                  >
                    🔄 {historicosPorCandidato[candidato.id].length}x
                  </span>
                )}
              </div>

              <div style={{ color: colors.text.secondary, fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                {candidato.Email}
              </div>

              <div style={{ color: colors.text.secondary, fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                {candidato.cargo_pretendido}
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{
                  padding: '4px 10px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  🟦 Novo
                </span>
              </div>

              <div style={{ color: colors.text.tertiary, fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                {formatarData(candidato.criado_em)}
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => downloadCurriculo(candidato.curriculo_url)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}
                  title="Ver CV"
                >
                  📄 CV
                </button>

                <button
                  onClick={() => iniciarProcesso(candidato)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}
                  title="Iniciar Processo"
                >
                  🚀 Iniciar
                </button>

                <button
                  onClick={() => adicionarAoBanco(candidato)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}
                  title="Banco de Talentos"
                >
                  ⭐ Banco
                </button>

                <button
                  onClick={() => deletarCandidato(candidato.id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}
                  title="Deletar"
                >
                  🗑️
                </button>
              </div>
            </div>

            {candidatoExpandido === candidato.id && (
              <div style={{
                padding: '20px',
                backgroundColor: colors.bg.primary,
                borderBottom: `1px solid ${colors.border.secondary}`
              }}>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {candidato.mensagem && (
                    <div>
                      <strong style={{ color: colors.status.warning, display: 'block', marginBottom: '8px' }}>
                        💬 Mensagem do Candidato:
                      </strong>
                      <div style={{
                        backgroundColor: colors.bg.tertiary,
                        padding: '15px',
                        borderRadius: '8px',
                        color: colors.text.secondary,
                        fontSize: '14px',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        border: `1px solid ${colors.border.secondary}`
                      }}>
                        {candidato.mensagem}
                      </div>
                    </div>
                  )}

                  {candidato.linkedin_url && (
                    <div>
                      <strong style={{ color: colors.text.primary, marginBottom: '5px', display: 'block' }}>
                        LinkedIn:
                      </strong>
                      <a 
                        href={candidato.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: colors.status.info, fontSize: '14px' }}
                      >
                        🔗 Ver perfil
                      </a>
                    </div>
                  )}

                  {historicosPorCandidato[candidato.id] && (
                    <div>
                      <strong style={{ color: colors.text.primary, marginBottom: '8px', display: 'block' }}>
                        📚 Histórico de Processos:
                      </strong>
                      <button
                        onClick={() => setMostrarHistorico(candidato.id)}
                        style={{
                          padding: '8px 16px',
                          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        🔄 Ver {historicosPorCandidato[candidato.id].length} processo(s) anterior(es)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {mostrarHistorico && historicosPorCandidato[mostrarHistorico] && (
        <div
          onClick={() => setMostrarHistorico(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: colors.bg.secondary,
              padding: '30px',
              borderRadius: '16px',
              maxWidth: '700px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              border: `1px solid ${colors.border.primary}`,
              boxShadow: colors.shadow.lg
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #f59e0b'
            }}>
              <h3 style={{
                color: colors.text.primary,
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '20px',
                fontWeight: '700'
              }}>
                🔄 Histórico de Processos
              </h3>
              <button
                onClick={() => setMostrarHistorico(null)}
                style={{
                  background: colors.bg.hover,
                  color: colors.text.primary,
                  border: 'none',
                  borderRadius: '8px',
                  width: '36px',
                  height: '36px',
                  cursor: 'pointer',
                  fontSize: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = colors.bg.tertiary}
                onMouseLeave={(e) => e.target.style.background = colors.bg.hover}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {historicosPorCandidato[mostrarHistorico].map((hist, index) => (
                <div
                  key={hist.id}
                  style={{
                    background: colors.bg.primary,
                    padding: '20px',
                    borderRadius: '12px',
                    border: `1px solid ${colors.border.secondary}`
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <div style={{
                        color: colors.text.primary,
                        fontWeight: '700',
                        fontSize: '16px',
                        marginBottom: '6px'
                      }}>
                        💼 {hist.cargo_pretendido}
                      </div>
                      <div style={{
                        color: colors.text.tertiary,
                        fontSize: '13px'
                      }}>
                        📅 {new Date(hist.data_inscricao).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <span style={{
                      background: hist.status_final === 'reprovado' ? '#ef4444' : 
                                 hist.status_final === 'aprovado' ? '#10b981' :
                                 hist.status_final === 'banco_talentos' ? '#f59e0b' : '#64748b',
                      color: 'white',
                      padding: '6px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {hist.status_final === 'reprovado' ? '❌ Reprovado' :
                       hist.status_final === 'aprovado' ? '✅ Aprovado' :
                       hist.status_final === 'banco_talentos' ? '⭐ Banco de Talentos' :
                       '⏳ Em Processo'}
                    </span>
                  </div>

                  {hist.score && (
                    <div style={{
                      color: colors.text.secondary,
                      fontSize: '14px',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{
                        background: hist.score >= 7 ? '#10b981' : hist.score >= 5 ? '#f59e0b' : '#ef4444',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        ⭐ Score: {hist.score}/10
                      </span>
                    </div>
                  )}

                  {hist.observacoes && (
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '12px',
                      borderRadius: '8px',
                      marginTop: '12px'
                    }}>
                      <div style={{
                        color: colors.text.primary,
                        fontSize: '13px',
                        fontWeight: '600',
                        marginBottom: '6px'
                      }}>
                        📝 Feedback anterior:
                      </div>
                      <div style={{
                        color: colors.text.secondary,
                        fontSize: '13px',
                        lineHeight: '1.6'
                      }}>
                        {hist.observacoes}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spinner {
          border: 3px solid ${colors.bg.tertiary};
          border-top-color: ${colors.status.warning};
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}