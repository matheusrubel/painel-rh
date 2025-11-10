import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import ModalBancoTalentos from './ModalBancoTalentos';

export default function TabelaCandidatos({ filtros, setPaginaAtual }) {
  const [candidatos, setCandidatos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [candidatoExpandido, setCandidatoExpandido] = useState(null);
  const [modalBancoAberto, setModalBancoAberto] = useState(false);
  const [candidatoSelecionado, setCandidatoSelecionado] = useState(null);

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
      // ← NOVO: Filtra para mostrar APENAS candidatos que NÃO estão no banco de talentos
      let query = supabase
        .from('candidatos')
        .select('*')
        .or('banco_talentos.is.null,banco_talentos.eq.false');
      
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
    }
  };

  const abrirModalBancoTalentos = (candidato) => {
    setCandidatoSelecionado(candidato);
    setModalBancoAberto(true);
  };

  const adicionarAoBanco = async ({ setor, observacoes }) => {
    const { error } = await supabase
      .from('candidatos')
      .update({ 
        banco_talentos: true,
        setor_interesse: setor,
        observacoes_talentos: observacoes
      })
      .eq('id', candidatoSelecionado.id);
    
    if (!error) {
      fetchCandidatos(); // Atualiza a lista (candidato vai sumir daqui)
      setModalBancoAberto(false);
      setCandidatoSelecionado(null);
      
      // Mostra mensagem de sucesso
      alert('Adicionado ao banco de talentos!');
      
      // Muda para aba Talentos após 500ms
      if (setPaginaAtual) {
        setTimeout(() => {
          setPaginaAtual('talentos');
        }, 500);
      }
    }
  };

  const downloadCurriculo = (url) => {
    if (!url || url.trim() === '') {
      alert('Currículo não disponível');
      return;
    }
    window.open(url, '_blank');
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

  const toggleExpand = (id) => {
    setCandidatoExpandido(candidatoExpandido === id ? null : id);
  };

  const getStatusColor = (status) => {
    const cores = {
      'novo': '#3b82f6',
      'em_analise': '#8b5cf6',
      'entrevista_agendada': '#eab308',
      'contratado': '#10b981',
      'dispensado': '#ef4444'
    };
    return cores[status] || '#6c757d';
  };

  const getStatusTexto = (status) => {
    const textos = {
      'novo': '🟦 Novo',
      'em_analise': '🟪 Em Análise',
      'entrevista_agendada': '🟨 Entrevista',
      'contratado': '🟩 Contratado',
      'dispensado': '🟥 Dispensado'
    };
    return textos[status] || status;
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

  if (candidatos.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        color: '#94a3b8'
      }}>
        <p style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: '#cbd5e1' }}>
          Nenhum candidato encontrado
        </p>
        <p style={{ fontSize: '0.875rem' }}>
          Tente ajustar os filtros de pesquisa
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: '1rem 0', marginBottom: '1rem' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          {candidatos.length} candidato(s) encontrado(s)
        </p>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {candidatos.map(candidato => (
          <div key={candidato.id} style={{
            border: '1px solid #334155',
            borderRadius: '8px',
            backgroundColor: '#1e293b',
            overflow: 'hidden'
          }}>
            <div 
              onClick={() => toggleExpand(candidato.id)}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '15px 20px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                backgroundColor: candidatoExpandido === candidato.id ? '#334155' : 'transparent'
              }}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#f8fafc', fontSize: '18px' }}>
                  {candidato.nome_completo}
                </h3>
                <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                  <span>📧 {candidato.Email}</span>
                  {candidato.telefone && <span> | 📱 {candidato.telefone}</span>}
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '3px' }}>
                  <span>💼 {candidato.cargo_pretendido}</span>
                  <span> | 📅 {formatarDataBrasileira(candidato.criado_em)}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  padding: '5px 15px',
                  backgroundColor: getStatusColor(candidato.status),
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {getStatusTexto(candidato.status)}
                </div>
                
                <span style={{ fontSize: '20px', color: '#94a3b8' }}>
                  {candidatoExpandido === candidato.id ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {candidatoExpandido === candidato.id && (
              <div style={{ 
                padding: '20px', 
                borderTop: '1px solid #334155',
                animation: 'slideDown 0.3s ease-out'
              }}>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {candidato.mensagem && (
                    <div>
                      <strong style={{ color: '#f8fafc' }}>Mensagem:</strong>
                      <p style={{ color: '#cbd5e1', marginTop: '5px', whiteSpace: 'pre-wrap' }}>
                        {candidato.mensagem}
                      </p>
                    </div>
                  )}

                  {candidato.linkedin_url && (
                    <div>
                      <strong style={{ color: '#f8fafc' }}>LinkedIn:</strong>
                      <div style={{ marginTop: '5px' }}>
                        <a href={candidato.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: '#f59e0b' }}>
                          Ver perfil
                        </a>
                      </div>
                    </div>
                  )}

                  <div style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    flexWrap: 'wrap',
                    paddingTop: '15px', 
                    borderTop: '1px solid #334155' 
                  }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '5px' }}>
                        Status:
                      </label>
                      <select
                        value={candidato.status || 'novo'}
                        onChange={(e) => atualizarStatus(candidato.id, e.target.value)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '4px',
                          border: '1px solid #334155',
                          fontSize: '14px',
                          cursor: 'pointer',
                          background: '#334155',
                          color: '#f8fafc'
                        }}
                      >
                        <option value="novo">🟦 Novo</option>
                        <option value="em_analise">🟪 Em Análise</option>
                        <option value="entrevista_agendada">🟨 Entrevista</option>
                        <option value="contratado">🟩 Contratado</option>
                        <option value="dispensado">🟥 Dispensado</option>
                      </select>
                    </div>

                    <button
                      onClick={() => downloadCurriculo(candidato.curriculo_url)}
                      style={{
                        padding: '8px 15px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        alignSelf: 'flex-end'
                      }}
                    >
                      📄 Ver Currículo
                    </button>

                    <button
                      onClick={() => abrirModalBancoTalentos(candidato)}
                      style={{
                        padding: '8px 15px',
                        backgroundColor: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        alignSelf: 'flex-end'
                      }}
                    >
                      ⭐ Adicionar ao Banco
                    </button>

                    <button
                      onClick={() => deletarCandidato(candidato.id)}
                      style={{
                        padding: '8px 15px',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        alignSelf: 'flex-end'
                      }}
                    >
                      🗑️ Deletar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <ModalBancoTalentos
        isOpen={modalBancoAberto}
        onClose={() => {
          setModalBancoAberto(false);
          setCandidatoSelecionado(null);
        }}
        onConfirm={adicionarAoBanco}
        candidato={candidatoSelecionado}
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
