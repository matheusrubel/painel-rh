import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { showSuccess, showError } from '../utils/toast';
import { handleError } from '../utils/errorHandler';

// Modal de Confirmação
function ModalConfirmacao({ isOpen, onClose, onConfirm, titulo, mensagem, tipo = 'remover', carregando }) {
  if (!isOpen) return null;

  const cores = {
    remover: { bg: '#f59e0b', bgHover: '#d97706', texto: 'Remover' },
    deletar: { bg: '#ef4444', bgHover: '#dc2626', texto: 'Deletar' }
  };

  const config = cores[tipo];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'var(--overlay-bg)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'var(--gradient-secondary)',
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        border: `1px solid ${config.bg}40`,
        boxShadow: `var(--shadow-xl)`,
        animation: 'slideUp 0.3s ease-out'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: `${config.bg}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '32px'
          }}>
            {tipo === 'deletar' ? '🗑️' : '❌'}
          </div>
          <h2 style={{ 
            color: 'var(--text-primary)', 
            margin: '0 0 12px 0',
            fontSize: '22px',
            fontWeight: '700'
          }}>
            {titulo}
          </h2>
          <p style={{ 
            color: 'var(--text-tertiary)', 
            margin: 0,
            fontSize: '15px',
            lineHeight: '1.6'
          }}>
            {mensagem}
          </p>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'center' 
        }}>
          <button
            onClick={onClose}
            disabled={carregando}
            style={{
              padding: '12px 28px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              cursor: carregando ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              opacity: carregando ? 0.5 : 1
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={carregando}
            style={{
              padding: '12px 28px',
              background: carregando 
                ? 'rgba(148, 163, 184, 0.3)' 
                : `linear-gradient(135deg, ${config.bg} 0%, ${config.bgHover} 100%)`,
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: carregando ? 'not-allowed' : 'pointer',
              fontWeight: '700',
              fontSize: '14px',
              opacity: carregando ? 0.6 : 1,
              boxShadow: carregando ? 'none' : `0 4px 12px ${config.bg}40`
            }}
          >
            {carregando ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="spinner" style={{ width: '14px', height: '14px' }} />
                Processando...
              </span>
            ) : `${tipo === 'deletar' ? '🗑️' : '❌'} ${config.texto}`}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0; 
            transform: translateY(20px);
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

// Componente Principal
export default function BancoTalentos() {
  const [talentos, setTalentos] = useState([]);
  const [talentosHistorico, setTalentosHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [talentoExpandido, setTalentoExpandido] = useState(null);
  const [filtroSetor, setFiltroSetor] = useState('todos');
  const [busca, setBusca] = useState('');
  
  const [modalRemover, setModalRemover] = useState({ isOpen: false, candidatoId: null });
  const [modalDeletar, setModalDeletar] = useState({ isOpen: false, candidatoId: null });
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    fetchTalentos();
  }, [filtroSetor]);

  const fetchTalentos = async () => {
    setCarregando(true);
    try {
      // 1. Buscar candidatos ativos no banco de talentos
      let queryCandidatos = supabase
        .from('candidatos')
        .select('*')
        .eq('banco_talentos', true)
        .order('criado_em', { ascending: false });

      if (filtroSetor !== 'todos') {
        queryCandidatos = queryCandidatos.eq('setor_interesse', filtroSetor);
      }

      const { data: candidatosAtivos, error: erroCandidatos } = await queryCandidatos;
      if (erroCandidatos) throw erroCandidatos;

      // 2. Buscar candidatos do histórico marcados como banco_talentos
      let queryHistorico = supabase
        .from('historico_candidatos')
        .select('*')
        .eq('status_final', 'banco_talentos')
        .order('data_inscricao', { ascending: false });

      if (filtroSetor !== 'todos') {
        queryHistorico = queryHistorico.eq('setor_interesse', filtroSetor);
      }

      const { data: historicoTalentos, error: erroHistorico } = await queryHistorico;
      if (erroHistorico) throw erroHistorico;

      // 3. Marcar origem dos dados
      const candidatosComOrigem = (candidatosAtivos || []).map(c => ({ ...c, origem: 'ativo' }));
      const historicoComOrigem = (historicoTalentos || []).map(h => ({ 
        ...h, 
        origem: 'historico',
        Email: h.email,
        criado_em: h.data_inscricao
      }));

      setTalentos(candidatosComOrigem);
      setTalentosHistorico(historicoComOrigem);
      
    } catch (err) {
      handleError(err, 'Erro ao buscar talentos');
    } finally {
      setCarregando(false);
    }
  };

  const removerDoTalentos = async (id, origem) => {
    setProcessando(true);
    try {
      if (origem === 'ativo') {
        await supabase
          .from('candidatos')
          .update({ banco_talentos: false, setor_interesse: null, observacoes_talentos: null })
          .eq('id', id);
      } else {
        // Atualizar histórico
        await supabase
          .from('historico_candidatos')
          .update({ status_final: 'reprovado' })
          .eq('id', id);
      }

      showSuccess('✅ Candidato removido do Banco de Talentos!');
      await fetchTalentos();
    } catch (err) {
      handleError(err, 'Erro ao remover candidato');
    } finally {
      setProcessando(false);
      setModalRemover({ isOpen: false, candidatoId: null });
    }
  };

  const deletarCandidato = async (id, origem) => {
    setProcessando(true);
    try {
      if (origem === 'ativo') {
        await supabase.from('candidatos').delete().eq('id', id);
      } else {
        await supabase.from('historico_candidatos').delete().eq('id', id);
      }

      showSuccess('🗑️ Candidato deletado permanentemente!');
      await fetchTalentos();
    } catch (err) {
      handleError(err, 'Erro ao deletar candidato');
    } finally {
      setProcessando(false);
      setModalDeletar({ isOpen: false, candidatoId: null });
    }
  };

  const downloadCurriculo = (url) => {
    if (!url) {
      showError('❌ Currículo não disponível');
      return;
    }
    window.open(url, '_blank');
  };

  // Combinar e filtrar talentos
  const todosTalentos = [...talentos, ...talentosHistorico];
  
  const talentosFiltrados = todosTalentos.filter(talento => {
    if (!busca) return true;
    const termo = busca.toLowerCase();
    return (
      talento.nome_completo.toLowerCase().includes(termo) ||
      talento.Email?.toLowerCase().includes(termo) ||
      talento.cargo_pretendido?.toLowerCase().includes(termo) ||
      talento.setor_interesse?.toLowerCase().includes(termo)
    );
  });

  const setores = ['todos', ...new Set(todosTalentos.map(t => t.setor_interesse).filter(Boolean))];

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
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
          Carregando banco de talentos...
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{
        background: 'var(--gradient-secondary)',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '25px',
        border: '1px solid var(--border-color)'
      }}>
        <h2 style={{
          color: 'var(--text-primary)',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '24px'
        }}>
          ⭐ Banco de Talentos
        </h2>
        <p style={{ color: 'var(--text-tertiary)', fontSize: '14px', margin: 0 }}>
          {todosTalentos.length} talento{todosTalentos.length !== 1 ? 's' : ''} cadastrado{todosTalentos.length !== 1 ? 's' : ''}
          {talentosHistorico.length > 0 && ` • ${talentosHistorico.length} do histórico`}
        </p>
      </div>

      {/* Filtros */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '25px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="🔍 Buscar por nome, cargo, email..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{
            flex: 1,
            minWidth: '300px',
            padding: '12px 15px',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />

        <select
          value={filtroSetor}
          onChange={(e) => setFiltroSetor(e.target.value)}
          style={{
            padding: '12px 15px',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            minWidth: '200px'
          }}
        >
          <option value="todos">📁 Todos os Setores</option>
          {setores.filter(s => s !== 'todos').map(setor => (
            <option key={setor} value={setor}>{setor}</option>
          ))}
        </select>
      </div>

      {/* Lista de Talentos */}
      {talentosFiltrados.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'var(--gradient-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⭐</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>
            Nenhum talento encontrado
          </h3>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>
            {busca ? 'Tente ajustar os filtros de busca' : 'Adicione candidatos ao Banco de Talentos durante o processo seletivo'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {talentosFiltrados.map((talento) => (
            <div
              key={`${talento.origem}-${talento.id}`}
              onClick={() => setTalentoExpandido(talentoExpandido === talento.id ? null : talento.id)}
              style={{
                background: 'var(--gradient-secondary)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '20px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    color: 'var(--text-primary)',
                    marginBottom: '8px',
                    fontSize: '18px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {talento.nome_completo}
                    {talento.origem === 'historico' && (
                      <span style={{
                        background: 'rgba(245, 158, 11, 0.2)',
                        color: '#fbbf24',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        📜 Histórico
                      </span>
                    )}
                  </h3>

                  <p style={{ 
                    color: 'var(--text-tertiary)', 
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
                      color: 'var(--text-tertiary)', 
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
                        whiteSpace: 'nowrap'
                      }}
                    >
                      📄 Currículo
                    </button>
                  )}

                  <button
                    onClick={() => setModalRemover({ isOpen: true, candidatoId: talento.id, origem: talento.origem })}
                    style={{
                      background: '#f59e0b',
                      color: '#fff',
                      border: 'none',
                      padding: '9px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    ❌ Remover
                  </button>

                  <button
                    onClick={() => setModalDeletar({ isOpen: true, candidatoId: talento.id, origem: talento.origem })}
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      padding: '9px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}
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
                  borderTop: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)'
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
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                        {talento.mensagem}
                      </p>
                    </div>
                  )}
                  
                  {(talento.observacoes_talentos || talento.observacoes) && (
                    <div style={{ 
                      padding: '15px',
                      background: 'rgba(245, 158, 11, 0.1)',
                      borderLeft: '3px solid #f59e0b',
                      borderRadius: '6px'
                    }}>
                      <strong style={{ display: 'block', marginBottom: '8px', color: '#f59e0b' }}>
                        📝 Observações do Banco:
                      </strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>
                        {talento.observacoes_talentos || talento.observacoes}
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

                  <div style={{ marginTop: '15px', fontSize: '12px', color: 'var(--text-quaternary)' }}>
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

      {/* Modais */}
      <ModalConfirmacao
        isOpen={modalRemover.isOpen}
        onClose={() => setModalRemover({ isOpen: false, candidatoId: null, origem: null })}
        onConfirm={() => removerDoTalentos(modalRemover.candidatoId, modalRemover.origem)}
        titulo="Remover do Banco de Talentos?"
        mensagem="Este candidato será removido do banco de talentos, mas continuará no sistema."
        tipo="remover"
        carregando={processando}
      />

      <ModalConfirmacao
        isOpen={modalDeletar.isOpen}
        onClose={() => setModalDeletar({ isOpen: false, candidatoId: null, origem: null })}
        onConfirm={() => deletarCandidato(modalDeletar.candidatoId, modalDeletar.origem)}
        titulo="Deletar Candidato Permanentemente?"
        mensagem="⚠️ ATENÇÃO: Esta ação é irreversível! O candidato será completamente removido do sistema."
        tipo="deletar"
        carregando={processando}  
      />
    </div>
  );
}