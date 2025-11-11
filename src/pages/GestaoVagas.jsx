import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import ModalCriarVaga from '../components/ModalCriarVaga';

export default function GestaoVagas() {
  const [vagas, setVagas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [vagaExpandida, setVagaExpandida] = useState(null);

  useEffect(() => {
    fetchVagas();
  }, []);

  const fetchVagas = async () => {
    setCarregando(true);
    const { data, error } = await supabase
      .from('vagas')
      .select('*')
      .order('criado_em', { ascending: false });
    
    if (!error) {
      setVagas(data || []);
    }
    setCarregando(false);
  };

  const toggleVagaAtiva = async (id, ativaAtual) => {
    const { error } = await supabase
      .from('vagas')
      .update({ ativa: !ativaAtual })
      .eq('id', id);
    
    if (!error) {
      fetchVagas();
      alert(ativaAtual ? 'Vaga desativada!' : 'Vaga ativada!');
    }
  };

  const deletarVaga = async (id) => {
    if (window.confirm('Deseja realmente deletar esta vaga?')) {
      const { error } = await supabase.from('vagas').delete().eq('id', id);
      if (!error) {
        fetchVagas();
        alert('Vaga deletada!');
      }
    }
  };

  const toggleExpand = (id) => {
    setVagaExpandida(vagaExpandida === id ? null : id);
  };

  const getBadgePrioridade = (prioridade) => {
    const cores = {
      'Urgente': { bg: '#dc2626', icon: '🔴' },
      'Normal': { bg: '#f59e0b', icon: '🟡' },
      'Baixa': { bg: '#10b981', icon: '🟢' }
    };
    const config = cores[prioridade] || cores['Normal'];
    return { backgroundColor: config.bg, icon: config.icon };
  };

  const getBadgeModalidade = (modalidade) => {
    const icones = {
      'Presencial': '🏢',
      'Híbrido': '🔄',
      'Remoto': '🏠'
    };
    return icones[modalidade] || '📍';
  };

  const formatarSalario = (min, max) => {
    if (!min && !max) return 'A combinar';
    if (!min) return `Até R$ ${max.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    if (!max) return `A partir de R$ ${min.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    return `R$ ${min.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} - R$ ${max.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  if (carregando) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #334155',
          borderTopColor: '#f59e0b',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#94a3b8' }}>Carregando vagas...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ color: '#f8fafc', marginBottom: '5px' }}>Gestão de Vagas</h2>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            {vagas.length} vaga(s) cadastrada(s)
          </p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
            transition: 'all 0.3s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
          }}
        >
          <span style={{ fontSize: '18px' }}>+</span> Criar Nova Vaga
        </button>
      </div>

      {vagas.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px', 
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px dashed #334155'
        }}>
          <p style={{ fontSize: '48px', marginBottom: '10px' }}>📋</p>
          <p style={{ color: '#cbd5e1', fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
            Nenhuma vaga cadastrada
          </p>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Clique em "Criar Nova Vaga" para começar!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {vagas.map(vaga => (
            <div key={vaga.id} style={{
              border: '1px solid #334155',
              borderRadius: '8px',
              backgroundColor: vaga.ativa ? '#1e293b' : '#0f172a',
              overflow: 'hidden',
              transition: 'all 0.3s'
            }}>
              {/* Card Header */}
              <div 
                onClick={() => toggleExpand(vaga.id)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '15px 20px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  backgroundColor: vagaExpandida === vaga.id ? '#334155' : 'transparent'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '18px' }}>
                      {vaga.titulo}
                    </h3>
                    
                    {/* Badge Prioridade */}
                    {vaga.prioridade && (
                      <span style={{
                        padding: '3px 10px',
                        ...getBadgePrioridade(vaga.prioridade),
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {getBadgePrioridade(vaga.prioridade).icon} {vaga.prioridade}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: '#94a3b8' }}>
                    {vaga.area_setor && <span>💼 {vaga.area_setor}</span>}
                    {vaga.nivel && <span>📊 {vaga.nivel}</span>}
                    {vaga.local && <span>📍 {vaga.local}</span>}
                    {vaga.modalidade && <span>{getBadgeModalidade(vaga.modalidade)} {vaga.modalidade}</span>}
                    {vaga.tipo_contrato && <span>📄 {vaga.tipo_contrato}</span>}
                    {vaga.numero_vagas && vaga.numero_vagas > 1 && (
                      <span style={{ 
                        color: '#f59e0b',
                        fontWeight: 'bold'
                      }}>
                        🎯 {vaga.numero_vagas} vagas
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
                    📅 {new Date(vaga.criado_em).toLocaleDateString('pt-BR')}
                    {vaga.prazo_fechamento && (
                      <span style={{ marginLeft: '12px', color: '#f59e0b' }}>
                        ⏰ Prazo: {new Date(vaga.prazo_fechamento).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    padding: '6px 18px',
                    backgroundColor: vaga.ativa ? '#10b981' : '#6c757d',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {vaga.ativa ? '✅ ATIVA' : '⏸️ INATIVA'}
                  </div>
                  
                  <span style={{ fontSize: '20px', color: '#94a3b8' }}>
                    {vagaExpandida === vaga.id ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Detalhes Expandidos */}
              {vagaExpandida === vaga.id && (
                <div style={{ 
                  padding: '20px', 
                  borderTop: '1px solid #334155',
                  animation: 'slideDown 0.3s ease-out'
                }}>
                  {/* Informações Principais */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '15px',
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#0f172a',
                    borderRadius: '8px'
                  }}>
                    {vaga.carga_horaria && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>CARGA HORÁRIA</div>
                        <div style={{ color: '#f8fafc', fontWeight: 'bold' }}>⏰ {vaga.carga_horaria}</div>
                      </div>
                    )}
                    
                    {(vaga.faixa_salarial_min || vaga.faixa_salarial_max) && (
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>REMUNERAÇÃO</div>
                        <div style={{ color: '#10b981', fontWeight: 'bold' }}>
                          💰 {formatarSalario(vaga.faixa_salarial_min, vaga.faixa_salarial_max)}
                        </div>
                      </div>
                    )}
                  </div>

                  {vaga.descricao && (
                    <div style={{ marginBottom: '15px' }}>
                      <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '8px' }}>📝 Descrição:</strong>
                      <p style={{ color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>{vaga.descricao}</p>
                    </div>
                  )}

                  {vaga.atribuicoes && vaga.atribuicoes.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                      <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '8px' }}>✅ Atribuições:</strong>
                      <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                        {vaga.atribuicoes.map((attr, i) => (
                          <li key={i} style={{ color: '#cbd5e1', marginBottom: '5px' }}>{attr}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {vaga.requisitos && vaga.requisitos.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                      <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '8px' }}>📋 Requisitos:</strong>
                      <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                        {vaga.requisitos.map((req, i) => (
                          <li key={i} style={{ color: '#cbd5e1', marginBottom: '5px' }}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {vaga.beneficios && vaga.beneficios.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                      <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '8px' }}>🎁 Benefícios:</strong>
                      <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                        {vaga.beneficios.map((ben, i) => (
                          <li key={i} style={{ color: '#cbd5e1', marginBottom: '5px' }}>{ben}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {vaga.observacoes_internas && (
                    <div style={{ 
                      marginBottom: '15px',
                      padding: '12px',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid #f59e0b',
                      borderRadius: '6px'
                    }}>
                      <strong style={{ color: '#f59e0b', display: 'block', marginBottom: '8px' }}>
                        🔒 Observações Internas (RH):
                      </strong>
                      <p style={{ color: '#cbd5e1', margin: 0, fontSize: '14px' }}>{vaga.observacoes_internas}</p>
                    </div>
                  )}

                  {/* Botões de Ação */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    marginTop: '20px', 
                    paddingTop: '15px', 
                    borderTop: '1px solid #334155',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => toggleVagaAtiva(vaga.id, vaga.ativa)}
                      style={{
                        padding: '10px 18px',
                        backgroundColor: vaga.ativa ? '#f59e0b' : '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'all 0.3s'
                      }}
                    >
                      {vaga.ativa ? '⏸️ Desativar' : '▶️ Ativar'}
                    </button>
                    <button
                      onClick={() => deletarVaga(vaga.id)}
                      style={{
                        padding: '10px 18px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        transition: 'all 0.3s'
                      }}
                    >
                      🗑️ Deletar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ModalCriarVaga
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onVagaCriada={fetchVagas}
      />

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}