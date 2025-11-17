import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { showSuccess, showError } from '../utils/toast';
import { handleError } from '../utils/errorHandler';
import { useTheme } from '../contexts/ThemeContext'; // ✅ NOVO

export default function ModalDetalhesEtapa({ candidato, isOpen, onClose, onAtualizar }) {
  const { colors } = useTheme(); // ✅ NOVO
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    score: '',
    observacoes: ''
  });
  const [etapaExpandida, setEtapaExpandida] = useState(null);
  const [historicoAnterior, setHistoricoAnterior] = useState([]);
  const [mostrarHistoricoModal, setMostrarHistoricoModal] = useState(false);

  useEffect(() => {
    if (isOpen && candidato) {
      fetchHistorico();
      fetchHistoricoAnterior(); // ✅ NOVO
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

      if (error) throw error;

      setHistorico(data || []);

      const etapaAtual = data?.[0];
      if (etapaAtual) {
        setFormData({
          score: etapaAtual.score || '',
          observacoes: etapaAtual.observacoes || ''
        });
      }
    } catch (err) {
      handleError(err, 'Erro ao buscar histórico');
    } finally {
      setCarregando(false);
    }
  };

  // ✅ NOVO: Buscar histórico de processos anteriores
  const fetchHistoricoAnterior = async () => {
    try {
      const { data: historicos } = await supabase
        .from('historico_candidatos')
        .select('*')
        .or(`nome_completo.ilike.%${candidato.nome_completo}%,telefone.eq.${candidato.telefone}`)
        .order('data_inscricao', { ascending: false });

      if (historicos && historicos.length > 0) {
        setHistoricoAnterior(historicos);
      }
    } catch (err) {
      console.error('Erro ao buscar histórico anterior:', err);
    }
  };

  const handleSalvarObservacoes = async () => {
    if (!historico[0]) {
      showError('Nenhuma etapa ativa para salvar');
      return;
    }

    try {
      const score = formData.score ? parseFloat(formData.score) : null;

      if (score !== null && (score < 0 || score > 10)) {
        showError('Score deve ser entre 0 e 10');
        return;
      }

      const { error } = await supabase
        .from('etapas_candidato')
        .update({
          score: score,
          observacoes: formData.observacoes
        })
        .eq('id', historico[0].id);

      if (error) throw error;

      if (score !== null) {
        await supabase
          .from('candidatos')
          .update({ score: score })
          .eq('id', candidato.id);
      }

      showSuccess('📝 Observações salvas com sucesso!');
      setEditando(false);
      fetchHistorico();
      
      if (onAtualizar) {
        onAtualizar();
      }
    } catch (err) {
      handleError(err, 'Erro ao salvar observações');
    }
  };

  const toggleEtapa = (id) => {
    setEtapaExpandida(etapaExpandida === id ? null : id);
  };

  const formatarData = (dataString) => {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEtapaInfo = (etapaId) => {
    const etapas = {
      'triagem': { nome: 'Triagem', icone: '📋', cor: '#3b82f6' },
      'pre_entrevista': { nome: 'Pré-entrevista', icone: '📝', cor: '#8b5cf6' },
      'entrevista_rh': { nome: 'Entrevista RH', icone: '💼', cor: '#f59e0b' },
      'teste_tecnico': { nome: 'Teste Técnico', icone: '🧪', cor: '#06b6d4' },
      'teste_comportamental': { nome: 'Teste Comportamental', icone: '🎯', cor: '#10b981' },
      'entrevista_final': { nome: 'Entrevista Final', icone: '⭐', cor: '#f59e0b' },
      'aprovado': { nome: 'Aprovado', icone: '✅', cor: '#10b981' },
      'reprovado': { nome: 'Reprovado', icone: '❌', cor: '#ef4444' }
    };
    return etapas[etapaId] || { nome: etapaId, icone: '📌', cor: '#64748b' };
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      overflowY: 'auto'
    }}>
      <div style={{
        background: colors.bg.secondary,
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: `1px solid ${colors.border.primary}`,
        margin: '20px 0',
        boxShadow: colors.shadow.lg
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ color: colors.text.primary, marginBottom: '8px' }}>
              📊 Detalhes do Candidato
            </h2>
            <h3 style={{ color: colors.text.secondary, fontWeight: 'normal', fontSize: '18px' }}>
              {candidato?.nome_completo}
            </h3>
            <p style={{ color: colors.text.tertiary, fontSize: '14px', marginTop: '4px' }}>
              {candidato?.cargo_pretendido}
            </p>
            {/* ✅ NOVO: Tag de histórico anterior */}
            {historicoAnterior.length > 0 && (
              <div
                onClick={() => setMostrarHistoricoModal(true)}
                style={{
                  marginTop: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#9c9898ff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.3)';
                }}
              >
                🔄 Já participou de {historicoAnterior.length} processo(s) anterior(es)
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {/* ✅ BOTÃO VER CURRÍCULO */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (candidato?.curriculo_url) {
                  window.open(candidato.curriculo_url, '_blank');
                  showSuccess('📄 Abrindo currículo...');
                } else {
                  showError('❌ Currículo não disponível');
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: '#9e9797ff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
              title="Abrir currículo em nova aba"
            >
              📄 Ver Currículo
            </button>
            <button
              onClick={onClose}
              style={{
                background: colors.bg.hover,
                color: colors.text.primary,
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '18px'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {carregando ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.text.tertiary }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `4px solid ${colors.bg.tertiary}`,
              borderTop: `4px solid ${colors.status.info}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 15px'
            }} />
            <p>Carregando histórico...</p>
          </div>
        ) : (
          <>
            {/* Etapa Atual - Edição */}
            {historico.length > 0 && (
              <div style={{
                background: colors.bg.tertiary,
                padding: '20px',
                borderRadius: '8px',
                border: `1px solid ${colors.border.primary}`,
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ color: colors.text.primary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getEtapaInfo(historico[0].etapa).icone} Etapa Atual: {getEtapaInfo(historico[0].etapa).nome}
                  </h3>
                  {!editando ? (
                    <button
                      onClick={() => setEditando(true)}
                      style={{
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      ✏️ Editar
                    </button>
                  ) : null}
                </div>

                {editando ? (
                  <>
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ color: colors.text.secondary, display: 'block', marginBottom: '8px' }}>
                        Score (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={formData.score}
                        onChange={(e) => setFormData(prev => ({ ...prev, score: e.target.value }))}
                        placeholder="Ex: 8.5"
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: colors.bg.primary,
                          color: colors.text.primary,
                          border: `1px solid ${colors.border.primary}`,
                          borderRadius: '6px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ color: colors.text.secondary, display: 'block', marginBottom: '8px' }}>
                        Observações
                      </label>
                      <textarea
                        value={formData.observacoes}
                        onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                        rows={4}
                        placeholder="Adicione observações sobre o desempenho do candidato..."
                        style={{
                          width: '100%',
                          padding: '10px',
                          background: colors.bg.primary,
                          color: colors.text.primary,
                          border: `1px solid ${colors.border.primary}`,
                          borderRadius: '6px',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => {
                          setEditando(false);
                          const etapaAtual = historico[0];
                          setFormData({
                            score: etapaAtual.score || '',
                            observacoes: etapaAtual.observacoes || ''
                          });
                        }}
                        style={{
                          padding: '10px 20px',
                          background: colors.bg.hover,
                          color: colors.text.primary,
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSalvarObservacoes}
                        style={{
                          padding: '10px 20px',
                          background: '#10b981',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        💾 Salvar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {historico[0].score && (
                      <div style={{ marginBottom: '10px' }}>
                        <strong style={{ color: colors.text.secondary }}>Score: </strong>
                        <span style={{
                          background: historico[0].score >= 7 ? '#10b981' : historico[0].score >= 5 ? '#f59e0b' : '#ef4444',
                          color: '#fff',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontWeight: 'bold'
                        }}>
                          ⭐ {historico[0].score}/10
                        </span>
                      </div>
                    )}
                    {historico[0].observacoes && (
                      <div>
                        <strong style={{ color: colors.text.secondary }}>Observações: </strong>
                        <p style={{ color: colors.text.tertiary, marginTop: '8px' }}>
                          {historico[0].observacoes}
                        </p>
                      </div>
                    )}
                    {!historico[0].score && !historico[0].observacoes && (
                      <p style={{ color: colors.text.muted, fontStyle: 'italic' }}>
                        Nenhuma observação registrada ainda
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Histórico Completo */}
            <div>
              <h3 style={{ color: colors.text.primary, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📜 Histórico de Etapas ({historico.length})
              </h3>

              {historico.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: colors.text.tertiary }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>📭</div>
                  <p>Nenhuma etapa registrada ainda</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {historico.map((etapa, index) => {
                    const etapaInfo = getEtapaInfo(etapa.etapa);
                    const isExpandido = etapaExpandida === etapa.id;

                    return (
                      <div
                        key={etapa.id}
                        style={{
                          background: index === 0 
                            ? colors.bg.tertiary
                            : colors.bg.secondary,
                          padding: '15px',
                          borderRadius: '8px',
                          border: `1px solid ${index === 0 ? etapaInfo.cor : colors.border.primary}`,
                          cursor: 'pointer'
                        }}
                        onClick={() => toggleEtapa(etapa.id)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '24px' }}>{etapaInfo.icone}</span>
                            <div>
                              <div style={{ 
                                color: colors.text.primary, 
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                {etapaInfo.nome}
                                {index === 0 && (
                                  <span style={{
                                    background: etapaInfo.cor,
                                    color: '#fff',
                                    padding: '2px 8px',
                                    borderRadius: '12px',
                                    fontSize: '10px'
                                  }}>
                                    ATUAL
                                  </span>
                                )}
                              </div>
                              <div style={{ color: colors.text.tertiary, fontSize: '12px', marginTop: '4px' }}>
                                {formatarData(etapa.criado_em)}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {etapa.score && (
                              <span style={{
                                background: etapa.score >= 7 ? '#10b981' : etapa.score >= 5 ? '#f59e0b' : '#ef4444',
                                color: '#fff',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                ⭐ {etapa.score}
                              </span>
                            )}
                            <span style={{ color: colors.text.tertiary, fontSize: '18px' }}>
                              {isExpandido ? '▼' : '▶'}
                            </span>
                          </div>
                        </div>

                        {isExpandido && (
                          <div style={{ 
                            marginTop: '15px', 
                            paddingTop: '15px', 
                            borderTop: `1px solid ${colors.border.secondary}`
                          }}>
                            {etapa.observacoes && (
                              <div style={{ marginBottom: '10px' }}>
                                <strong style={{ color: colors.text.secondary, fontSize: '13px' }}>Observações:</strong>
                                <p style={{ color: colors.text.tertiary, marginTop: '5px', fontSize: '13px' }}>
                                  {etapa.observacoes}
                                </p>
                              </div>
                            )}

                            {etapa.motivo_reprovacao && (
                              <div>
                                <strong style={{ color: '#ef4444', fontSize: '13px' }}>Motivo da Reprovação:</strong>
                                <p style={{ color: colors.text.tertiary, marginTop: '5px', fontSize: '13px' }}>
                                  {etapa.motivo_reprovacao.replace(/_/g, ' ').toUpperCase()}
                                </p>
                              </div>
                            )}

                            {!etapa.observacoes && !etapa.motivo_reprovacao && (
                              <p style={{ color: colors.text.muted, fontSize: '13px', fontStyle: 'italic' }}>
                                Sem observações registradas
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              background: colors.bg.hover,
              color: colors.text.primary,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Fechar
          </button>
        </div>
      </div>

      {/* ✅ MODAL DE HISTÓRICO ANTERIOR */}
      {mostrarHistoricoModal && (
        <div
          onClick={() => setMostrarHistoricoModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10001,
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
                🔄 Processos Anteriores
              </h3>
              <button
                onClick={() => setMostrarHistoricoModal(false)}
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

            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{
                color: '#f59e0b',
                margin: 0,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                ℹ️ <strong>Este candidato já participou de {historicoAnterior.length} processo(s) seletivo(s) anteriormente</strong>
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {historicoAnterior.map((hist, index) => (
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
                      marginBottom: '12px'
                    }}>
                      <span style={{
                        background: hist.score >= 7 ? '#10b981' : hist.score >= 5 ? '#f59e0b' : '#ef4444',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
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
                        📝 Feedback do processo anterior:
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
    </div>
  );
}