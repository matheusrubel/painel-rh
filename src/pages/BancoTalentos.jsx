import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export default function BancoTalentos() {
  const [talentos, setTalentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [talentoExpandido, setTalentoExpandido] = useState(null);
  const [filtroSetor, setFiltroSetor] = useState('todos');

  useEffect(() => {
    fetchTalentos();
  }, [filtroSetor]);

  const fetchTalentos = async () => {
    setCarregando(true);
    try {
      let query = supabase
        .from('candidatos')
        .select('*')
        .eq('banco_talentos', true)
        .order('criado_em', { ascending: false });

      if (filtroSetor !== 'todos') {
        query = query.eq('setor_interesse', filtroSetor);
      }

      const { data, error } = await query;
      if (!error) {
        setTalentos(data || []);
      }
    } catch (err) {
      console.error('Erro ao buscar talentos:', err);
    }
    setCarregando(false);
  };

  const removerDoTalentos = async (id) => {
    if (window.confirm('Remover este candidato do banco de talentos?')) {
      const { error } = await supabase
        .from('candidatos')
        .update({ 
          banco_talentos: false,
          setor_interesse: null,
          observacoes_talentos: null
        })
        .eq('id', id);
      
      if (!error) {
        fetchTalentos();
        alert('Removido do banco de talentos!');
      }
    }
  };

  // ← NOVO: Função para deletar candidato definitivamente
  const deletarCandidato = async (id) => {
    if (window.confirm('⚠️ ATENÇÃO: Deseja deletar este candidato PERMANENTEMENTE do sistema?\n\nEsta ação não pode ser desfeita!')) {
      const { error } = await supabase
        .from('candidatos')
        .delete()
        .eq('id', id);
      
      if (!error) {
        fetchTalentos();
        alert('Candidato deletado permanentemente!');
      } else {
        alert('Erro ao deletar candidato.');
      }
    }
  };

  const toggleExpand = (id) => {
    setTalentoExpandido(talentoExpandido === id ? null : id);
  };

  const downloadCurriculo = (url) => {
    if (!url) {
      alert('Currículo não disponível');
      return;
    }
    window.open(url, '_blank');
  };

  if (carregando) {
    return <div style={{ textAlign: 'center', padding: '20px', color: '#cbd5e1' }}>Carregando...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#f8fafc', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          ⭐ Banco de Talentos
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Candidatos marcados para oportunidades futuras
        </p>
      </div>

      {/* Filtro por Setor */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontWeight: 'bold' }}>
          Filtrar por Setor:
        </label>
        <select
          value={filtroSetor}
          onChange={(e) => setFiltroSetor(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #475569',
            backgroundColor: '#334155',
            color: '#f8fafc',
            fontSize: '14px',
            minWidth: '200px'
          }}
        >
          <option value="todos">Todos os Setores</option>
          <option value="Contabilidade">Contabilidade</option>
          <option value="Fiscal">Fiscal</option>
          <option value="RH">RH</option>
          <option value="TI">TI</option>
          <option value="Administrativo">Administrativo</option>
          <option value="Financeiro">Financeiro</option>
          <option value="Comercial">Comercial</option>
          <option value="Atendimento">Atendimento</option>
          <option value="Outro">Outro</option>
        </select>
      </div>

      {/* Contador */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          {talentos.length} talento(s) encontrado(s)
        </p>
      </div>

      {talentos.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '50px', 
          color: '#64748b',
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          border: '1px dashed #334155'
        }}>
          <p style={{ fontSize: '48px', marginBottom: '10px' }}>⭐</p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px', color: '#cbd5e1' }}>
            Nenhum talento no banco
          </p>
          <p style={{ fontSize: '14px' }}>
            Adicione candidatos promissores clicando na estrela
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {talentos.map(talento => (
            <div key={talento.id} style={{
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              backgroundColor: '#1e293b',
              overflow: 'hidden'
            }}>
              {/* Card Header */}
              <div 
                onClick={() => toggleExpand(talento.id)}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '15px 20px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  backgroundColor: talentoExpandido === talento.id ? '#334155' : 'transparent'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                    <span style={{ fontSize: '20px' }}>⭐</span>
                    <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '18px' }}>
                      {talento.nome_completo}
                    </h3>
                  </div>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                    <span>💼 {talento.cargo_pretendido}</span>
                    {talento.setor_interesse && (
                      <span style={{ 
                        marginLeft: '10px',
                        padding: '2px 8px',
                        backgroundColor: '#f59e0b',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: 'white'
                      }}>
                        {talento.setor_interesse}
                      </span>
                    )}
                  </div>
                </div>
                
                <span style={{ fontSize: '20px', color: '#94a3b8' }}>
                  {talentoExpandido === talento.id ? '▲' : '▼'}
                </span>
              </div>

              {/* Detalhes Expandidos */}
              {talentoExpandido === talento.id && (
                <div style={{ 
                  padding: '20px', 
                  borderTop: '1px solid #334155'
                }}>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {/* Contato */}
                    <div>
                      <strong style={{ color: '#f8fafc' }}>Contato:</strong>
                      <div style={{ marginTop: '5px', color: '#cbd5e1', fontSize: '14px' }}>
                        <div>📧 {talento.Email}</div>
                        {talento.telefone && <div>📱 {talento.telefone}</div>}
                      </div>
                    </div>

                    {/* ← NOVO: LinkedIn */}
                    {talento.linkedin_url && (
                      <div>
                        <strong style={{ color: '#f8fafc' }}>LinkedIn:</strong>
                        <div style={{ marginTop: '5px' }}>
                          <a 
                            href={talento.linkedin_url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ 
                              color: '#f59e0b',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            🔗 Ver perfil no LinkedIn
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Mensagem */}
                    {talento.mensagem && (
                      <div>
                        <strong style={{ color: '#f8fafc' }}>Mensagem Original:</strong>
                        <p style={{ color: '#cbd5e1', marginTop: '5px', whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                          {talento.mensagem}
                        </p>
                      </div>
                    )}

                    {/* Observações */}
                    {talento.observacoes_talentos && (
                      <div>
                        <strong style={{ color: '#f8fafc' }}>Observações do Banco de Talentos:</strong>
                        <p style={{ color: '#cbd5e1', marginTop: '5px', whiteSpace: 'pre-wrap', fontSize: '14px' }}>
                          {talento.observacoes_talentos}
                        </p>
                      </div>
                    )}

                    {/* Ações */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '10px', 
                      paddingTop: '15px', 
                      borderTop: '1px solid #334155',
                      flexWrap: 'wrap'
                    }}>
                      <button
                        onClick={() => downloadCurriculo(talento.curriculo_url)}
                        style={{
                          padding: '8px 15px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        📄 Ver Currículo
                      </button>
                      <button
                        onClick={() => removerDoTalentos(talento.id)}
                        style={{
                          padding: '8px 15px',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        ❌ Remover do Banco
                      </button>
                      {/* ← NOVO: Botão de deletar permanentemente */}
                      <button
                        onClick={() => deletarCandidato(talento.id)}
                        style={{
                          padding: '8px 15px',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        🗑️ Deletar Permanentemente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
