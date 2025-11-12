import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { showSuccess, showError } from '../utils/toast';
import { handleError } from '../utils/errorHandler';

export default function BancoTalentos() {
  const [talentos, setTalentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [talentoExpandido, setTalentoExpandido] = useState(null);
  const [filtroSetor, setFiltroSetor] = useState('todos');
  const [busca, setBusca] = useState('');

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

      if (error) throw error;
      
      setTalentos(data || []);
    } catch (err) {
      handleError(err, 'Erro ao buscar talentos');
    } finally {
      setCarregando(false);
    }
  };

  const removerDoTalentos = async (id) => {
    if (!window.confirm('Remover este candidato do banco de talentos?')) return;
    
    try {
      const { error } = await supabase
        .from('candidatos')
        .update({ 
          banco_talentos: false, 
          setor_interesse: null,
          observacoes_talentos: null 
        })
        .eq('id', id);

      if (error) throw error;

      showSuccess('✅ Removido do banco de talentos!');
      fetchTalentos();
    } catch (err) {
      handleError(err, 'Erro ao remover do banco');
    }
  };

  const deletarCandidato = async (id) => {
    if (!window.confirm('⚠️ ATENÇÃO: Deseja deletar este candidato PERMANENTEMENTE do sistema?\n\nEsta ação não pode ser desfeita!')) return;
    
    try {
      const { error } = await supabase
        .from('candidatos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showSuccess('🗑️ Candidato deletado permanentemente!');
      fetchTalentos();
    } catch (err) {
      handleError(err, 'Erro ao deletar candidato');
    }
  };

  const toggleExpand = (id) => {
    setTalentoExpandido(talentoExpandido === id ? null : id);
  };

  const downloadCurriculo = (url) => {
    if (!url) {
      showError('❌ Currículo não disponível');
      return;
    }
    window.open(url, '_blank');
  };

  // Filtrar por busca local
  const talentosFiltrados = talentos.filter(talento => {
    if (!busca) return true;
    const termo = busca.toLowerCase();
    return (
      talento.nome_completo.toLowerCase().includes(termo) ||
      talento.Email.toLowerCase().includes(termo) ||
      talento.cargo_pretendido.toLowerCase().includes(termo)
    );
  });

  if (carregando) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #334155',
          borderTop: '4px solid #f59e0b',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 15px'
        }} />
        <p>Carregando banco de talentos...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '25px',
        border: '1px solid #334155'
      }}>
        <h2 style={{ 
          color: '#f8fafc', 
          marginBottom: '10px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          fontSize: '24px'
        }}>
          ⭐ Banco de Talentos
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Candidatos marcados para oportunidades futuras
        </p>
      </div>

      {/* Filtros e Busca */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div style={{ color: '#cbd5e1', fontSize: '15px' }}>
          <strong style={{ color: '#f59e0b' }}>{talentosFiltrados.length}</strong> talento{talentosFiltrados.length !== 1 ? 's' : ''} encontrado{talentosFiltrados.length !== 1 ? 's' : ''}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Campo de Busca */}
          <input
            type="text"
            placeholder="🔍 Buscar por nome, email ou cargo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{
              background: '#334155',
              color: '#f8fafc',
              border: '1px solid #475569',
              padding: '10px 15px',
              borderRadius: '6px',
              minWidth: '250px',
              fontSize: '14px'
            }}
          />

          {/* Filtro por Setor */}
          <select
            value={filtroSetor}
            onChange={(e) => setFiltroSetor(e.target.value)}
            style={{
              background: '#334155',
              color: '#f8fafc',
              border: '1px solid #475569',
              padding: '10px 15px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <option value="todos">📁 Todos os setores</option>
            <option value="TI">💻 TI</option>
            <option value="RH">👥 RH</option>
            <option value="Financeiro">💰 Financeiro</option>
            <option value="Comercial">📊 Comercial</option>
            <option value="Operações">⚙️ Operações</option>
            <option value="Marketing">📢 Marketing</option>
            <option value="Administrativo">📋 Administrativo</option>
          </select>
        </div>
      </div>

      {/* Lista de Talentos */}
      {talentosFiltrados.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          borderRadius: '12px',
          border: '1px solid #334155'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>
            {busca ? '🔍' : '📭'}
          </div>
          <h3 style={{ color: '#f8fafc', marginBottom: '10px' }}>
            {busca ? 'Nenhum talento encontrado' : 'Nenhum talento no banco'}
          </h3>
          <p style={{ color: '#94a3b8' }}>
            {busca 
              ? 'Tente buscar com outros termos'
              : 'Adicione candidatos promissores clicando na estrela ⭐'
            }
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {talentosFiltrados.map((talento) => (
            <div
              key={talento.id}
              style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #475569',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => toggleExpand(talento.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = '1px solid #f59e0b';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(245, 158, 11, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '1px solid #475569';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ 
                    color: '#f8fafc', 
                    marginBottom: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    fontSize: '18px',
                    fontWeight: '600'
                  }}>
                    ⭐ {talento.nome_completo}
                  </h3>
                  <p style={{ 
                    color: '#94a3b8', 
                    fontSize: '14px', 
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    📧 {talento.Email}
                  </p>
                  {talento.telefone && (
                    <p style={{ 
                      color: '#94a3b8', 
                      fontSize: '14px', 
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      📱 {talento.telefone}
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      background: '#f59e0b',
                      color: '#fff',
                      padding: '5px 12px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      💼 {talento.cargo_pretendido}
                    </span>
                    {talento.setor_interesse && (
                      <span style={{
                        background: '#3b82f6',
                        color: '#fff',
                        padding: '5px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        📁 {talento.setor_interesse}
                      </span>
                    )}
                    {talento.score && (
                      <span style={{
                        background: talento.score >= 7 ? '#10b981' : talento.score >= 5 ? '#f59e0b' : '#ef4444',
                        color: '#fff',
                        padding: '5px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        ⭐ Score: {talento.score}/10
                      </span>
                    )}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }} onClick={(e) => e.stopPropagation()}>
                  {talento.curriculo_url && (
                    <button
                      onClick={() => downloadCurriculo(talento.curriculo_url)}
                      style={{
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        padding: '9px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                      onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                    >
                      📄 Currículo
                    </button>
                  )}

                  <button
                    onClick={() => removerDoTalentos(talento.id)}
                    style={{
                      background: '#f59e0b',
                      color: '#fff',
                      border: 'none',
                      padding: '9px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#d97706'}
                    onMouseLeave={(e) => e.target.style.background = '#f59e0b'}
                  >
                    ❌ Remover
                  </button>

                  <button
                    onClick={() => deletarCandidato(talento.id)}
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      padding: '9px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                    onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                  >
                    🗑️ Deletar
                  </button>
                </div>
              </div>

              {/* Detalhes Expandidos */}
              {talentoExpandido === talento.id && (
                <div style={{ 
                  marginTop: '20px', 
                  paddingTop: '20px', 
                  borderTop: '1px solid #475569',
                  color: '#cbd5e1'
                }}>
                  {talento.mensagem && (
                    <div style={{ 
                      marginBottom: '15px',
                      padding: '15px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      borderLeft: '3px solid #3b82f6',
                      borderRadius: '6px'
                    }}>
                      <strong style={{ display: 'block', marginBottom: '8px', color: '#3b82f6' }}>
                        💬 Mensagem do Candidato:
                      </strong>
                      <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                        {talento.mensagem}
                      </p>
                    </div>
                  )}
                  
                  {talento.observacoes_talentos && (
                    <div style={{ 
                      padding: '15px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      borderLeft: '3px solid #f59e0b',
                      borderRadius: '6px'
                    }}>
                      <strong style={{ display: 'block', marginBottom: '8px', color: '#f59e0b' }}>
                        📝 Observações do Banco:
                      </strong>
                      <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>
                        {talento.observacoes_talentos}
                      </p>
                    </div>
                  )}

                  {talento.linkedin_url && (
                    <div style={{ marginTop: '15px' }}>
                      <a
                        href={talento.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#3b82f6',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        🔗 Ver LinkedIn
                      </a>
                    </div>
                  )}

                  <div style={{ marginTop: '15px', fontSize: '12px', color: '#64748b' }}>
                    Adicionado em: {new Date(talento.criado_em).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
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
