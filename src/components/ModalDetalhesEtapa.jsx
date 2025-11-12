import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { showSuccess, showError } from '../utils/toast'; // ✅ NOVO
import { handleError } from '../utils/errorHandler'; // ✅ NOVO

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
      handleError(err, 'Erro ao buscar histórico'); // ✅ MUDOU
    } finally {
      setCarregando(false);
    }
  };

  const handleSalvarObservacoes = async () => {
    if (!historico[0]) {
      showError('Nenhuma etapa ativa para salvar'); // ✅ MUDOU
      return;
    }

    try {
      const score = formData.score ? parseFloat(formData.score) : null;

      if (score !== null && (score < 0 || score > 10)) {
        showError('Score deve ser entre 0 e 10'); // ✅ MUDOU
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

      showSuccess('📝 Observações salvas com sucesso!'); // ✅ MUDOU
      setEditando(false);
      fetchHistorico();
      
      if (onAtualizar) {
        onAtualizar();
      }
    } catch (err) {
      handleError(err, 'Erro ao salvar observações'); // ✅ MUDOU
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
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid #475569',
        margin: '20px 0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ color: '#f8fafc', marginBottom: '8px' }}>
              📊 Detalhes do Candidato
            </h2>
            <h3 style={{ color: '#cbd5e1', fontWeight: 'normal', fontSize: '18px' }}>
              {candidato?.nome_completo}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px' }}>
              {candidato?.cargo_pretendido}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#475569',
              color: '#f8fafc',
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

        {carregando ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #334155',
              borderTop: '4px solid #3b82f6',
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
                background: 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #475569',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                      <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
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
                          background: '#1e293b',
                          color: '#f8fafc',
                          border: '1px solid #475569',
                          borderRadius: '6px'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
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
                          background: '#1e293b',
                          color: '#f8fafc',
                          border: '1px solid #475569',
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
                          background: '#475569',
                          color: '#f8fafc',
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
                        <strong style={{ color: '#cbd5e1' }}>Score: </strong>
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
                        <strong style={{ color: '#cbd5e1' }}>Observações: </strong>
                        <p style={{ color: '#94a3b8', marginTop: '8px' }}>
                          {historico[0].observacoes}
                        </p>
                      </div>
                    )}
                    {!historico[0].score && !historico[0].observacoes && (
                      <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                        Nenhuma observação registrada ainda
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Histórico Completo */}
            <div>
              <h3 style={{ color: '#f8fafc', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📜 Histórico de Etapas ({historico.length})
              </h3>

              {historico.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
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
                            ? 'linear-gradient(135deg, #334155 0%, #1e293b 100%)'
                            : '#1e293b',
                          padding: '15px',
                          borderRadius: '8px',
                          border: `1px solid ${index === 0 ? etapaInfo.cor : '#334155'}`,
                          cursor: 'pointer'
                        }}
                        onClick={() => toggleEtapa(etapa.id)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '24px' }}>{etapaInfo.icone}</span>
                            <div>
                              <div style={{ 
                                color: '#f8fafc', 
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
                              <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '4px' }}>
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
                            <span style={{ color: '#94a3b8', fontSize: '18px' }}>
                              {isExpandido ? '▼' : '▶'}
                            </span>
                          </div>
                        </div>

                        {isExpandido && (
                          <div style={{ 
                            marginTop: '15px', 
                            paddingTop: '15px', 
                            borderTop: '1px solid #334155'
                          }}>
                            {etapa.observacoes && (
                              <div style={{ marginBottom: '10px' }}>
                                <strong style={{ color: '#cbd5e1', fontSize: '13px' }}>Observações:</strong>
                                <p style={{ color: '#94a3b8', marginTop: '5px', fontSize: '13px' }}>
                                  {etapa.observacoes}
                                </p>
                              </div>
                            )}

                            {etapa.motivo_reprovacao && (
                              <div>
                                <strong style={{ color: '#ef4444', fontSize: '13px' }}>Motivo da Reprovação:</strong>
                                <p style={{ color: '#94a3b8', marginTop: '5px', fontSize: '13px' }}>
                                  {etapa.motivo_reprovacao.replace(/_/g, ' ').toUpperCase()}
                                </p>
                              </div>
                            )}

                            {!etapa.observacoes && !etapa.motivo_reprovacao && (
                              <p style={{ color: '#64748b', fontSize: '13px', fontStyle: 'italic' }}>
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
              background: '#475569',
              color: '#f8fafc',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
