import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export default function TabelaCandidatos({ filtros }) {
  const [candidatos, setCandidatos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetchCandidatos();
  }, [filtros]);

  const fetchCandidatos = async () => {
    setCarregando(true);
    try {
      let query = supabase.from('candidatos').select('*');
      
      if (filtros.status && filtros.status !== 'todos') {
        query = query.eq('status', filtros.status);
      }
      if (filtros.cargo) {
        query = query.ilike('cargo_pretendido', `%${filtros.cargo}%`);
      }

      const { data, error } = await query.order('criado_em', { ascending: false });
      if (!error) {
        setCandidatos(data || []);
      }
    } catch (err) {
      console.error('Erro ao buscar candidatos:', err);
    }
    setCarregando(false);
  };

  const atualizarStatus = async (id, novoStatus) => {
    const { error } = await supabase.from('candidatos').update({ status: novoStatus }).eq('id', id);
    if (!error) fetchCandidatos();
  };

  const deletarCandidato = async (id) => {
    if (window.confirm('Deseja realmente deletar este candidato?')) {
      const { error } = await supabase.from('candidatos').delete().eq('id', id);
      if (!error) fetchCandidatos();
    }
  };

  if (carregando) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Carregando...</div>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Nome</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Email</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Telefone</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Cargo</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {candidatos.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ padding: '20px', textAlign: 'center', border: '1px solid #ddd' }}>
                Nenhum candidato encontrado
              </td>
            </tr>
          ) : (
            candidatos.map((candidato) => (
              <tr key={candidato.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{candidato.nome_completo}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{candidato.Email}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{candidato.telefone}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{candidato.cargo_pretendido}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <select
                    value={candidato.status || 'novo'}
                    onChange={(e) => atualizarStatus(candidato.id, e.target.value)}
                    style={{ padding: '5px' }}
                  >
                    <option value="novo">Novo</option>
                    <option value="em_analise">Em Análise</option>
                    <option value="entrevista_agendada">Entrevista Agendada</option>
                    <option value="contratado">Contratado</option>
                    <option value="dispensado">Dispensado</option>
                  </select>
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  <button
                    onClick={() => deletarCandidato(candidato.id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
