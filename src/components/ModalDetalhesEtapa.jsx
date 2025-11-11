import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export default function ModalDetalhesEtapa({ candidato, isOpen, onClose, onAtualizar }) {
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    score: '',
    observacoes: ''
  });
  const [etapaExpandida, setEtapaExpandida] = useState(null);

  useEffect(() => {
    if (isOpen && candidato) {
      fetchHistorico();
    }
  }, [isOpen, candidato]);

  const fetchHistorico = async () => {
    setCarregando(true);
    try {
      const { data, error } = await supabase
        .from('etapas_candidato')
        .select('*')
        .eq('candidato_id', candidato.id)
        .order('criado_em', { ascending: false });

      if (!error) {
        setHistorico(data || []);
        const etapaAtual = data?.[0];
        if (etapaAtual) {
          setFormData({
            score: etapaAtual.score || '',
            observacoes: etapaAtual.observacoes || ''
          });
        }
      }
    } catch (err) {
      console.error('Erro ao buscar histórico:', err);
    }
    setCarregando(false);
  };

  const salvarEdicao = async () => {
    try {
      const etapaAtualId = historico[0]?.id;
      if (!etapaAtualId) return;

      const { error } = await supabase
        .from('etapas_candidato')
        .update({
          score: formData.score ? parseInt(formData.score) : null,
          observacoes: formData.observacoes
        })
        .eq('id', etapaAtualId);

      if (!error) {
        alert('Atualizado com sucesso!');
        setEditando(false);
        fetchHistorico();
        onAtualizar();
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao salvar alterações');
    }
  };

  const getNomeEtapa = (etapa) => {
    const nomes = {
      'triagem': '📋 Triagem',
      'pre_entrevista': '📝 Pré-entrevista',
      'entrevista_rh': '💼 Entrevista RH',
      'teste_tecnico': '🧪 Teste Técnico',
      'teste_comportamental': '🎯 Teste Comportamental',
      'entrevista_final': '⭐ Entrevista Final',
      'aprovado': '✅ Aprovado',
      'reprovado': '❌ Reprovado'
    };
    return nomes[etapa] || etapa;
  };

  const getCorEtapa = (etapa) => {
    const cores = {
      'triagem': '#3b82f6',
      'pre_entrevista': '#8b5cf6',
      'entrevista_rh': '#f59e0b',
      'teste_tecnico': '#06b6d4',
      'teste_comportamental': '#10b981',
      'entrevista_final': '#f59e0b',
      'aprovado': '#10b981',
      'reprovado': '#ef4444'
    };
    return cores[etapa] || '#64748b';
  };

  const getCorStatus = (status) => {
    const cores = {
      'pendente': '#94a3b8',
      'em_andamento': '#f59e0b',
      'concluido': '#10b981',
      'reprovado': '#ef4444'
    };
    return cores[status] || '#94a3b8';
  };

  const getTextoStatus = (status, index) => {
    if (index === 0) {
      if (status === 'em_andamento') return 'ATUAL';
      if (status === 'concluido') return 'Concluído';
      if (status === 'reprovado') return 'Reprovado';
      return 'Atual';
    } else {
      if (status === 'em_andamento') return 'Próxima Etapa';
      if (status === 'concluido') return 'Concluído';
      if (status === 'reprovado') return 'Reprovado';
      if (status === 'pendente') return 'Pendente';
      return status;
    }
  };

  const calcularTempoNaEtapa = (dataInicio, dataConclusao) => {
    const inicio = new Date(dataInicio);
    const fim = dataConclusao ? new Date(dataConclusao) : new Date();
    const diff = fim.getTime() - inicio.getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (dias === 0 && horas === 0) return 'Menos de 1h';
    if (dias === 0) return `${horas}h`;
    if (dias === 1) return '1 dia';
    return `${dias} dias`;
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '900px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={{
          padding: '20px',
          borderBottom: '2px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              color: '#f8fafc',
              margin: '0 0 5px 0',
              fontSize: '22px'
            }}>
              {candidato.nome_completo}
            </h2>
            <p style={{
              color: '#94a3b8',
              margin: 0,
              fontSize: '14px'
            }}>
              💼 {candidato.cargo_pretendido}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '28px',
              cursor: 'pointer',
              padding: '0',
              width: '36px',
              height: '36px'
            }}
          >
            ×
          </button>
        </div>

        {/* CONTEÚDO */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px'
        }}>
          {carregando ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '40px',
              color: '#94a3b8'
            }}>
              Carregando histórico...
            </div>
          ) : historico.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#64748b'
            }}>
              <p>Nenhum histórico disponível</p>
            </div>
          ) : (
            <div>
              <h3 style={{
                color: '#f8fafc',
                fontSize: '18px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📊 Histórico do Pipeline
                <span style={{
                  fontSize: '14px',
                  fontWeight: '400',
                  color: '#64748b'
                }}>
                  ({historico.length} {historico.length === 1 ? 'etapa' : 'etapas'})
                </span>
              </h3>

              {/* TIMELINE COM LINHA VERTICAL */}
              <div style={{ position: 'relative' }}>
                {/* Linha vertical da timeline */}
                <div style={{
                  position: 'absolute',
                  left: '19px',
                  top: '20px',
                  bottom: '20px',
                  width: '2px',
                  backgroundColor: '#334155'
                }} />

                {historico.map((etapa, index) => {
                  const isExpanded = etapaExpandida === etapa.id;
                  const isAtual = index === 0;
                  const corEtapa = getCorEtapa(etapa.etapa);

                  return (
                    <div
                      key={etapa.id}
                      style={{
                        position: 'relative',
                        marginBottom: index === historico.length - 1 ? 0 : '20px',
                        marginLeft: '50px'
                      }}
                    >
                      {/* Bolinha colorida na timeline */}
                      <div style={{
                        position: 'absolute',
                        left: '-40px',
                        top: '16px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: corEtapa,
                        border: '3px solid #1e293b',
                        zIndex: 1,
                        boxShadow: isAtual ? `0 0 12px ${corEtapa}` : 'none'
                      }} />

                      {/* CARD DA ETAPA */}
                      <div style={{
                        backgroundColor: isAtual ? '#0f172a' : '#0f172a',
                        border: isAtual ? `2px solid ${corEtapa}` : '1px solid #334155',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        boxShadow: isAtual ? '0 4px 12px rgba(0,0,0,0.3)' : 'none'
                      }}>
                        {/* HEADER DO CARD */}
                        <div
                          onClick={() => !isAtual && setEtapaExpandida(isExpanded ? null : etapa.id)}
                          style={{
                            padding: '16px',
                            cursor: isAtual ? 'default' : 'pointer',
                            backgroundColor: isExpanded ? '#1e293b' : 'transparent'
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                marginBottom: '8px'
                              }}>
                                <span style={{
                                  color: '#f8fafc',
                                  fontSize: '16px',
                                  fontWeight: isAtual ? '600' : '500'
                                }}>
                                  {getNomeEtapa(etapa.etapa)}
                                </span>
                                <span style={{
                                  backgroundColor: getCorStatus(etapa.status),
                                  color: 'white',
                                  padding: '4px 10px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: 'bold'
                                }}>
                                  {getTextoStatus(etapa.status, index)}
                                </span>
                                {etapa.score && (
                                  <span style={{
                                    backgroundColor: etapa.score >= 70 ? '#10b981' : etapa.score >= 50 ? '#f59e0b' : '#ef4444',
                                    color: 'white',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                  }}>
                                    {etapa.score}/100
                                  </span>
                                )}
                              </div>
                              <div style={{
                                fontSize: '13px',
                                color: '#64748b',
                                display: 'flex',
                                gap: '12px'
                              }}>
                                <span>📅 {new Date(etapa.criado_em).toLocaleDateString('pt-BR')}</span>
                                <span>⏱️ {calcularTempoNaEtapa(etapa.data_inicio, etapa.data_conclusao)}</span>
                              </div>
                            </div>
                            {!isAtual && (
                              <div style={{
                                color: '#94a3b8',
                                fontSize: '18px',
                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                                transition: 'transform 0.2s'
                              }}>
                                ▼
                              </div>
                            )}
                          </div>
                        </div>

                        {/* CONTEÚDO DA ETAPA ATUAL */}
                        {isAtual && (
                          <div style={{
                            padding: '16px',
                            borderTop: '1px solid #334155'
                          }}>
                            {editando ? (
                              <div>
                                <div style={{ marginBottom: '12px' }}>
                                  <label style={{
                                    display: 'block',
                                    color: '#f8fafc',
                                    marginBottom: '5px',
                                    fontSize: '13px'
                                  }}>
                                    Pontuação (0-100)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.score}
                                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                                    style={{
                                      width: '100%',
                                      padding: '8px',
                                      backgroundColor: '#1e293b',
                                      border: '1px solid #334155',
                                      borderRadius: '6px',
                                      color: '#f8fafc',
                                      fontSize: '14px'
                                    }}
                                  />
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                  <label style={{
                                    display: 'block',
                                    color: '#f8fafc',
                                    marginBottom: '5px',
                                    fontSize: '13px'
                                  }}>
                                    Observações
                                  </label>
                                  <textarea
                                    value={formData.observacoes}
                                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                                    placeholder="Adicione observações sobre o candidato nesta etapa..."
                                    rows="4"
                                    style={{
                                      width: '100%',
                                      padding: '8px',
                                      backgroundColor: '#1e293b',
                                      border: '1px solid #334155',
                                      borderRadius: '6px',
                                      color: '#f8fafc',
                                      fontSize: '14px',
                                      resize: 'vertical',
                                      fontFamily: 'inherit'
                                    }}
                                  />
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                  <button
                                    onClick={salvarEdicao}
                                    style={{
                                      padding: '8px 16px',
                                      backgroundColor: '#10b981',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '14px',
                                      fontWeight: '600'
                                    }}
                                  >
                                    💾 Salvar
                                  </button>
                                  <button
                                    onClick={() => setEditando(false)}
                                    style={{
                                      padding: '8px 16px',
                                      backgroundColor: '#334155',
                                      color: '#f8fafc',
                                      border: 'none',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      fontSize: '14px'
                                    }}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                {etapa.observacoes ? (
                                  <div style={{
                                    backgroundColor: '#1e293b',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    color: '#cbd5e1',
                                    fontSize: '14px',
                                    marginBottom: '12px',
                                    lineHeight: '1.6',
                                    border: '1px solid #334155'
                                  }}>
                                    {etapa.observacoes}
                                  </div>
                                ) : (
                                  <p style={{
                                    color: '#64748b',
                                    fontSize: '13px',
                                    fontStyle: 'italic',
                                    marginBottom: '12px'
                                  }}>
                                    Nenhuma observação registrada
                                  </p>
                                )}

                                <button
                                  onClick={() => setEditando(true)}
                                  style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600'
                                  }}
                                >
                                  ✏️ Editar Feedback
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* CONTEÚDO EXPANDIDO DAS ETAPAS ANTERIORES */}
                        {!isAtual && isExpanded && (
                          <div style={{
                            padding: '16px',
                            borderTop: '1px solid #334155',
                            backgroundColor: '#1e293b'
                          }}>
                            {etapa.observacoes ? (
                              <div style={{
                                color: '#cbd5e1',
                                fontSize: '14px',
                                lineHeight: '1.6'
                              }}>
                                {etapa.observacoes}
                              </div>
                            ) : (
                              <div style={{
                                color: '#64748b',
                                fontSize: '13px',
                                fontStyle: 'italic'
                              }}>
                                Nenhuma observação registrada
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
