import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export default function TabelaCandidatos({ filtros }) {
  const [candidatos, setCandidatos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const formatarDataBrasileira = (data) => {
    if (!data) return 'N/A';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      if (error) {
        console.error('Erro Supabase:', error);
      } else {
        console.log('Dados recebidos:', data);
        setCandidatos(data || []);
      }
    } catch (err) {
      console.error('Erro ao buscar candidatos:', err);
    }
    setCarregando(false);
  };

  const atualizarStatus = async (id, novoStatus) => {
    const { error } = await supabase.from('candidatos').update({ status: novoStatus }).eq('id', id);
    if (!error) {
      fetchCandidatos();
      alert('Status atualizado com sucesso!');
    } else {
      console.error('Erro ao atualizar:', error);
    }
  };

  const toggleBancoTalentos = async (id, valorAtual) => {
    const { error } = await supabase.from('candidatos').update({ banco_talentos: !valorAtual }).eq('id', id);
    if (!error) {
      fetchCandidatos();
      alert(valorAtual ? 'Removido do banco de talentos!' : 'Adicionado ao banco de talentos!');
    }
  };

  const downloadCurriculo = (url, nome) => {
    if (!url || url.trim() === '') {
      alert('Currículo não disponível para este candidato');
      return;
    }
    if (url.startsWith('http')) {
      window.open(url, '_blank');
    } else {
      const bucketUrl = `https://${import.meta.env.VITE_SUPABASE_URL.split('/')[2]}/storage/v1/object/public/curriculos/${url}`;
      window.open(bucketUrl, '_blank');
    }
  };

  const deletarCandidato = async (id) => {
    if (window.confirm('Deseja realmente deletar este candidato?')) {
      const { error } = await supabase.from('candidatos').delete().eq('id', id);
      if (!error) {
        fetchCandidatos();
        alert('Candidato deletado!');
      }
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
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Mensagem</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Data Envio</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Currículo</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Banco Talentos</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {candidatos.length === 0 ? (
            <tr>
              <td colSpan="10" style={{ padding: '20px', textAlign: 'center', border: '1px solid #ddd' }}>
                Nenhum candidato encontrado
              </td>
            </tr>
          ) : (
            candidatos.map((candidato) => (
              <tr key={candidato.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{candidato.nome_completo || 'N/A'}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {candidato.Email || 'Sem email'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{candidato.telefone || 'N/A'}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>{candidato.cargo_pretendido || 'N/A'}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', maxWidth: '200px', wordWrap: 'break-word' }}>
                  {candidato.mensagem || 'Sem mensagem'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <select
                    value={candidato.status || 'novo'}
                    onChange={(e) => atualizarStatus(candidato.id, e.target.value)}
                    style={{ padding: '5px', width: '100%' }}
                  >
                    <option value="novo">Novo</option>
                    <option value="em_analise">Em Análise</option>
                    <option value="entrevista_agendada">Entrevista Agendada</option>
                    <option value="contratado">Contratado</option>
                    <option value="dispensado">Dispensado</option>
                  </select>
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {formatarDataBrasileira(candidato.criado_em)}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  <button
                    onClick={() => downloadCurriculo(candidato.curriculo_url, candidato.nome_completo)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    📄 Ver
                  </button>
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  <button
                    onClick={() => toggleBancoTalentos(candidato.id, candidato.banco_talentos)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: candidato.banco_talentos ? '#ffc107' : '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {candidato.banco_talentos ? '⭐ Sim' : '☆ Não'}
                  </button>
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
                    🗑️ Deletar
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
