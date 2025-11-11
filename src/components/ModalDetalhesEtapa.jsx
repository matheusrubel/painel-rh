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
        
        // Preencher form com dados da etapa atual
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

  const getCorStatus = (status) => {
    const cores = {
      'pendente': '#94a3b8',
      'em_andamento': '#f59e0b',
      'concluido': '#10b981',
      'reprovado': '#ef4444'
    };
    return cores[status] || '#94a3b8';
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
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      padding: '20px',
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid #334155',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 25px',
          borderBottom: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          backgroundColor: '#1e293b',
          zIndex: 10
        }}>
          <div>
            <h2 style={{ color: '#f8fafc', margin: 0, fontSize: '20px' }}>
              {candidato.nome_completo}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', margin: '5px 0 0 0' }}>
              💼 {candidato.cargo_pretendido}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px',
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>

        {/* Informações do Candidato */}
        <div style={{ padding: '20px 25px', borderBottom: '1px solid #334155' }}>
          <h3 style={{ color: '#fbbf24', fontSize: '16px', marginBottom: '12px' }}>
            📋 Informações do Candidato
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
            <div>
              <span style={{ color: '#64748b' }}>Email:</span>
              <div style={{ color: '#f8fafc', marginTop: '3px' }}>{candidato.Email}</div>
            </div>
            {candidato.telefone && (
              <div>
                <span style={{ color: '#64748b' }}>Telefone:</span>
                <div style={{ color: '#f8fafc', marginTop: '3px' }}>{candidato.telefone}</div>
              </div>
            )}
            <div>
              <span style={{ color: '#64748b' }}>Data Candidatura:</span>
              <div style={{ color: '#f8fafc', marginTop: '3px' }}>
                {new Date(candidato.criado_em).toLocaleDateString('pt-BR')}
              </div>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Status Geral:</span>
              <div style={{ color: '#f8fafc', marginTop: '3px' }}>
                {candidato.status || 'Novo'}
              </div>
            </div>
          </div>

          {candidato.curriculo_url && (
            <button
              onClick={() => window.open(candidato.curriculo_url, '_blank')}
              style={{
                marginTop: '15px',
                padding: '8px 16px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              📄 Ver Currículo
            </button>
          )}
        </div>

        {/* Etapa Atual - Edição */}
        {historico.length > 0 && (
          <div style={{ padding: '20px 25px', borderBottom: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ color: '#fbbf24', fontSize: '16px', margin: 0 }}>
                🎯 Etapa Atual: {getNomeEtapa(historico[0].etapa)}
              </h3>
              {!editando ? (
                <button
                  onClick={() => setEditando(true)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  ✏️ Editar
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={salvarEdicao}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    ✅ Salvar
                  </button>
                  <button
                    onClick={() => {
                      setEditando(false);
                      fetchHistorico();
                    }}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            {editando ? (
              <div style={{ display: 'grid', gap: '15px' }}>
                {/* Score */}
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '5px' }}>
                    Score (0-100):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#334155',
                      border: '1px solid #475569',
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Observações */}
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', fontSize: '14px', marginBottom: '5px' }}>
                    Observações:
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: '#334155',
                      border: '1px solid #475569',
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                    placeholder="Adicione observações sobre o candidato nesta etapa..."
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {historico[0].score && (
                  <div>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Score:</span>
                    <div style={{
                      display: 'inline-block',
                      marginLeft: '10px',
                      padding: '4px 12px',
                      backgroundColor: historico[0].score >= 70 ? '#10b981' : '#f59e0b',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>
                      {historico[0].score}
                    </div>
                  </div>
                )}
                {historico[0].observacoes && (
                  <div>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>Observações:</span>
                    <p style={{ color: '#f8fafc', marginTop: '5px', lineHeight: '1.6', fontSize: '14px' }}>
                      {historico[0].observacoes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Histórico de Etapas */}
        <div style={{ padding: '20px 25px' }}>
          <h3 style={{ color: '#fbbf24', fontSize: '16px', marginBottom: '15px' }}>
            📊 Histórico do Pipeline
          </h3>

          {carregando ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>
              Carregando histórico...
            </div>
          ) : historico.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
              Nenhum histórico disponível
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Linha do tempo */}
              <div style={{
                position: 'absolute',
                left: '20px',
                top: '10px',
                bottom: '10px',
                width: '2px',
                backgroundColor: '#334155'
              }}></div>

              {/* Itens do histórico */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {historico.map((etapa, index) => (
                  <div key={etapa.id} style={{
                    paddingLeft: '50px',
                    position: 'relative'
                  }}>
                    {/* Bolinha na timeline */}
                    <div style={{
                      position: 'absolute',
                      left: '12px',
                      top: '5px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: getCorStatus(etapa.status),
                      border: '3px solid #1e293b'
                    }}></div>

                    {/* Card da etapa */}
                    <div style={{
                      backgroundColor: index === 0 ? '#334155' : '#0f172a',
                      border: `1px solid ${index === 0 ? '#475569' : '#334155'}`,
                      borderRadius: '8px',
                      padding: '12px 15px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '14px' }}>
                            {getNomeEtapa(etapa.etapa)}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '12px', marginTop: '3px' }}>
                            {new Date(etapa.data_inicio).toLocaleString('pt-BR')}
                          </div>
                        </div>
                        <div style={{
                          padding: '3px 10px',
                          backgroundColor: getCorStatus(etapa.status),
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {etapa.status === 'em_andamento' && index === 0 ? 'ATUAL' : etapa.status}
                        </div>
                      </div>

                      <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
                        ⏱️ Tempo: {calcularTempoNaEtapa(etapa.data_inicio, etapa.data_conclusao)}
                      </div>

                      {etapa.score && (
                        <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
                          📊 Score: <span style={{
                            color: etapa.score >= 70 ? '#10b981' : '#f59e0b',
                            fontWeight: 'bold'
                          }}>{etapa.score}</span>
                        </div>
                      )}

                      {etapa.observacoes && (
                        <div style={{
                          marginTop: '10px',
                          padding: '10px',
                          backgroundColor: '#1e293b',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#cbd5e1',
                          lineHeight: '1.5'
                        }}>
                          {etapa.observacoes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '15px 25px',
          borderTop: '1px solid #334155',
          display: 'flex',
          justifyContent: 'flex-end',
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#1e293b'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              backgroundColor: '#475569',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}