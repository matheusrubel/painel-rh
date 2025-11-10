import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import ModalCriarVaga from '../components/ModalCriarVaga';

export default function GestaoVagas() {
  const [vagas, setVagas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

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

  if (carregando) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Carregando...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Gestão de Vagas</h2>
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
        <div style={{ display: 'grid', gap: '20px' }}>
          {vagas.map(vaga => (
            <div key={vaga.id} style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: vaga.ativa ? 'white' : '#f5f5f5'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>{vaga.titulo}</h2>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {vaga.local && <span>📍 {vaga.local} | </span>}
                    {vaga.tipo_contrato && <span>💼 {vaga.tipo_contrato} | </span>}
                    {vaga.salario && <span>💰 {vaga.salario}</span>}
                  </div>
                </div>
                <div style={{
                  padding: '5px 15px',
                  backgroundColor: vaga.ativa ? '#28a745' : '#6c757d',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {vaga.ativa ? 'ATIVA' : 'INATIVA'}
                </div>
              </div>

              {vaga.descricao && (
                <p style={{ color: '#666', marginBottom: '15px' }}>{vaga.descricao}</p>
              )}

              {vaga.atribuicoes && vaga.atribuicoes.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <strong>Atribuições:</strong>
                  <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                    {vaga.atribuicoes.map((attr, i) => (
                      <li key={i} style={{ color: '#666' }}>{attr}</li>
                    ))}
                  </ul>
                </div>
              )}

              {vaga.beneficios && vaga.beneficios.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <strong>Benefícios:</strong>
                  <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                    {vaga.beneficios.map((ben, i) => (
                      <li key={i} style={{ color: '#666' }}>{ben}</li>
                    ))}
                  </ul>
                </div>
              )}

              {vaga.requisitos && vaga.requisitos.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <strong>Requisitos:</strong>
                  <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                    {vaga.requisitos.map((req, i) => (
                      <li key={i} style={{ color: '#666' }}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  onClick={() => toggleVagaAtiva(vaga.id, vaga.ativa)}
                  style={{
                    padding: '8px 15px',
                    backgroundColor: vaga.ativa ? '#ffc107' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
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
                    cursor: 'pointer'
                  }}
                >
                  🗑️ Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalCriarVaga
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onVagaCriada={fetchVagas}
      />
    </div>
  );
}
