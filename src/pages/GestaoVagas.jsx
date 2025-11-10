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

  if (carregando) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Carregando...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#333' }}>Gestão de Vagas</h2>
        <button
          onClick={() => setModalAberto(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          + Criar Nova Vaga
        </button>
      </div>

      {vagas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          Nenhuma vaga cadastrada. Clique em "Criar Nova Vaga" para começar!
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {vagas.map(vaga => (
            <div key={vaga.id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: vaga.ativa ? 'white' : '#f5f5f5',
              overflow: 'hidden'
            }}>
              {/* Card Compacto (Header) */}
              <div 
                onClick={() => toggleExpand(vaga.id)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '15px 20px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  backgroundColor: vagaExpandida === vaga.id ? '#f8f9fa' : 'transparent'
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '18px' }}>{vaga.titulo}</h3>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {vaga.local && <span>📍 {vaga.local} | </span>}
                    <span>📅 {new Date(vaga.criado_em).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    padding: '5px 15px',
                    backgroundColor: vaga.ativa ? '#28a745' : '#6c757d',
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {vaga.ativa ? 'ATIVA' : 'INATIVA'}
                  </div>
                  
                  <span style={{ fontSize: '20px', color: '#666' }}>
                    {vagaExpandida === vaga.id ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Detalhes Expandidos - TEXTO PRETO CORRIGIDO */}
              {vagaExpandida === vaga.id && (
                <div style={{ 
                  padding: '20px', 
                  borderTop: '1px solid #ddd',
                  animation: 'slideDown 0.3s ease-out'
                }}>
                  {vaga.descricao && (
                    <div style={{ marginBottom: '15px' }}>
                      <strong style={{ color: '#333' }}>Descrição:</strong>
                      <p style={{ color: '#666', marginTop: '5px' }}>{vaga.descricao}</p>
                    </div>
                  )}

                  {vaga.atribuicoes && vaga.atribuicoes.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                      <strong style={{ color: '#333' }}>Atribuições:</strong>
                      <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                        {vaga.atribuicoes.map((attr, i) => (
                          <li key={i} style={{ color: '#666', marginBottom: '3px' }}>{attr}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {vaga.beneficios && vaga.beneficios.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                      <strong style={{ color: '#333' }}>Benefícios:</strong>
                      <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                        {vaga.beneficios.map((ben, i) => (
                          <li key={i} style={{ color: '#666', marginBottom: '3px' }}>{ben}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {vaga.requisitos && vaga.requisitos.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                      <strong style={{ color: '#333' }}>Requisitos:</strong>
                      <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                        {vaga.requisitos.map((req, i) => (
                          <li key={i} style={{ color: '#666', marginBottom: '3px' }}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                    <button
                      onClick={() => toggleVagaAtiva(vaga.id, vaga.ativa)}
                      style={{
                        padding: '8px 15px',
                        backgroundColor: vaga.ativa ? '#ffc107' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {vaga.ativa ? '⏸️ Desativar' : '▶️ Ativar'}
                    </button>
                    <button
                      onClick={() => deletarVaga(vaga.id)}
                      style={{
                        padding: '8px 15px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
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
      `}</style>
    </div>
  );
}
