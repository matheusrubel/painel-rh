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
        <p style={{ color: '#94a3b8' }}>Carregando candidatos...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Contador e Exportar */}
      <div style={{
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #334155',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          {candidatos.length} candidato(s) encontrado(s)
        </p>
      </div>

      {/* Tabela */}
      <div style={{ overflowX: 'auto' }}>
        {candidatos.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: '#94a3b8'
          }}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                margin: '0 auto 1rem',
                opacity: 0.3
              }}
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <p style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Nenhum candidato encontrado
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              Tente ajustar os filtros de pesquisa
            </p>
          </div>
        ) : (
          <table style={{
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: 0
          }}>
            <thead>
              <tr style={{ background: '#334155' }}>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #334155'
                }}>Nome</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #334155'
                }}>Email</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #334155'
                }}>Telefone</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #334155'
                }}>Cargo</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #334155'
                }}>Mensagem</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #334155'
                }}>Status</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #334155'
                }}>Data</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: 600,
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #334155'
                }}>Currículo</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: 600,
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #334155'
                }}>Talentos</th>
                <th style={{
                  padding: '1rem',
                  textAlign: 'center',
                  fontWeight: 600,
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #334155'
                }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {candidatos.map((candidato) => (
                <tr
                  key={candidato.id}
                  style={{
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#334155';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{
                    padding: '1rem',
                    borderBottom: '1px solid #334155',
                    color: '#f8fafc',
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}>
                    {candidato.nome_completo || 'N/A'}
                  </td>
                  <td style={{
                    padding: '1rem',
                    borderBottom: '1px solid #334155',
                    fontSize: '0.875rem'
                  }}>
                    <a
                      href={`mailto:${candidato.Email}`}
                      style={{
                        color: '#f59e0b',
                        textDecoration: 'none',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {candidato.Email || 'Sem email'}
                    </a>
                  </td>
                  <td style={{
                    padding: '1rem',
                    borderBottom: '1px solid #334155',
                    color: '#cbd5e1',
                    fontSize: '0.875rem'
                  }}>
                    {candidato.telefone || 'N/A'}
                  </td>
                  <td style={{
                    padding: '1rem',
                    borderBottom: '1px solid #334155',
                    color: '#cbd5e1',
                    fontSize: '0.875rem'
                  }}>
                    {candidato.cargo_pretendido || 'N/A'}
                  </td>
                  <td style={{
                    padding: '1rem',
                    borderBottom: '1px solid #334155',
                    color: '#cbd5e1',
                    fontSize: '0.875rem',
                    maxWidth: '200px',
                    wordWrap: 'break-word'
                  }}>
                    {candidato.mensagem || 'Sem mensagem'}
                  </td>
                  <td style={{
                    padding: '1rem',
                    borderBottom: '1px solid #334155'
                  }}>
                    <select
                      value={candidato.status || 'novo'}
                      onChange={(e) => atualizarStatus(candidato.id, e.target.value)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: 'none',
                        background: '#334155',
                        color: '#f8fafc',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        minWidth: '140px',
                        outline: 'none',
                        transition: 'all 0.3s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#f59e0b';
                      }}
                    >
                      <option value="novo">🟦 Novo</option>
                      <option value="em_analise">🟪 Em Análise</option>
                      <option value="entrevista_agendada">🟨 Entrevista</option>
                      <option value="contratado">🟩 Contratado</option>
                      <option value="dispensado">🟥 Dispensado</option>
                    </select>
                  </td>
                  <td style={{
                    padding: '1rem',
                    borderBottom: '1px solid #334155',
                    color: '#94a3b8',
                    fontSize: '0.75rem'
                  }}>
                    {formatarDataBrasileira(candidato.criado_em)}
                  </td>
                  <td style={{
                    padding: '1rem',
                    borderBottom: '1px solid #334155',
                    textAlign: 'center'
                  }}>
                    <button
                      onClick={() => downloadCurriculo(candidato.curriculo_url, candidato.nome_completo)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#059669';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#10b981';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      Ver
                    </button>
                  </td>
                  <td style={{
                    padding: '1rem',
                    borderBottom: '1px solid #334155',
                    textAlign: 'center'
                  }}>
                    <button
                      onClick={() => toggleBancoTalentos(candidato.id, candidato.banco_talentos)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: candidato.banco_talentos 
                          ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                          : '#334155',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                      }}
                    >
                      {candidato.banco_talentos ? '⭐ Sim' : '☆ Não'}
                    </button>
                  </td>
                  <td style={{
                    padding: '1rem',
                    borderBottom: '1px solid #334155',
                    textAlign: 'center'
                  }}>
                    <button
                      onClick={() => deletarCandidato(candidato.id)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#dc2626';
                        e.target.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#ef4444';
                        e.target.style.transform = 'translateY(0)';
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}