import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import ModalDetalhesEtapa from './ModalDetalhesEtapa';
import { showSuccess, showError } from '../utils/toast';
import { handleError } from '../utils/errorHandler';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';

const ETAPAS = [
  { id: 'triagem', nome: 'Triagem', cor: '#3b82f6', icone: '📋' },
  { id: 'pre_entrevista', nome: 'Pré-entrevista', cor: '#8b5cf6', icone: '📝' },
  { id: 'entrevista_rh', nome: 'Entrevista RH', cor: '#f59e0b', icone: '💼' },
  { id: 'teste_tecnico', nome: 'Teste Técnico', cor: '#06b6d4', icone: '🧪' },
  { id: 'teste_comportamental', nome: 'Teste Comportamental', cor: '#10b981', icone: '🎯' },
  { id: 'entrevista_final', nome: 'Entrevista Final', cor: '#f59e0b', icone: '⭐' },
  { id: 'aprovado', nome: 'Aprovado', cor: '#10b981', icone: '✅' },
  { id: 'reprovado', nome: 'Reprovado', cor: '#ef4444', icone: '❌' }
];

const DEPARTAMENTOS = [
  { id: 'todos', nome: 'Todos os Departamentos', icone: '🌐' },
  { id: 'contabil', nome: 'Contábil', icone: '📊' },
  { id: 'fiscal', nome: 'Fiscal', icone: '📋' },
  { id: 'pessoal', nome: 'Pessoal/RH', icone: '👥' },
  { id: 'administrativo', nome: 'Administrativo', icone: '🏢' },
  { id: 'ti', nome: 'Tecnologia', icone: '💻' },
  { id: 'comercial', nome: 'Comercial', icone: '💼' },
  { id: 'outros', nome: 'Outros', icone: '📦' }
];

// Modal de Reprovação - SEMPRE DARK
function ModalReprovacao({ isOpen, onClose, onConfirm, candidato }) {
  const [motivoReprovacao, setMotivoReprovacao] = useState('');
  const [adicionarTalentos, setAdicionarTalentos] = useState(false);
  const [setorTalentos, setSetorTalentos] = useState('');
  const [observacoesTalentos, setObservacoesTalentos] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!motivoReprovacao.trim()) {
      showError('⚠️ O motivo da reprovação é obrigatório!');
      return;
    }

    if (adicionarTalentos && !setorTalentos) {
      showError('⚠️ Selecione o setor de interesse para o Banco de Talentos!');
      return;
    }

    setEnviando(true);
    
    await onConfirm({
      motivoReprovacao: motivoReprovacao.trim(),
      adicionarTalentos,
      setorTalentos,
      observacoesTalentos: observacoesTalentos.trim()
    });

    setEnviando(false);
    handleClose();
  };

  const handleClose = () => {
    setMotivoReprovacao('');
    setAdicionarTalentos(false);
    setSetorTalentos('');
    setObservacoesTalentos('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={handleClose}
    >
      <div 
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          animation: 'slideUp 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{ 
            color: '#f8fafc',
            margin: 0,
            fontSize: '24px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.15)',
              fontSize: '20px'
            }}>
              ❌
            </span>
            Reprovar Candidato
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(148, 163, 184, 0.1)',
              border: 'none',
              color: '#cbd5e1',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              fontWeight: '300'
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '28px',
          border: '1px solid rgba(71, 85, 105, 0.3)'
        }}>
          <p style={{ 
            color: '#f8fafc', 
            margin: '0 0 8px 0', 
            fontWeight: '600',
            fontSize: '16px'
          }}>
            {candidato?.nome_completo}
          </p>
          <p style={{ 
            color: '#94a3b8', 
            margin: 0, 
            fontSize: '14px'
          }}>
            💼 {candidato?.cargo_pretendido || 'Cargo não informado'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              color: '#f1f5f9', 
              marginBottom: '10px',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              Motivo da Reprovação <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              value={motivoReprovacao}
              onChange={(e) => setMotivoReprovacao(e.target.value)}
              placeholder="Descreva o motivo da reprovação..."
              required
              rows="4"
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(71, 85, 105, 0.4)',
                borderRadius: '10px',
                color: '#f1f5f9',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            padding: '18px',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={adicionarTalentos}
                onChange={(e) => setAdicionarTalentos(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  accentColor: '#f59e0b'
                }}
              />
              <span style={{
                color: '#f8fafc',
                fontSize: '15px',
                fontWeight: '600'
              }}>
                ⭐ Adicionar ao Banco de Talentos
              </span>
            </label>
          </div>

          {adicionarTalentos && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  color: '#f1f5f9',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  Setor de Interesse <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={setorTalentos}
                  onChange={(e) => setSetorTalentos(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(71, 85, 105, 0.4)',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Selecione um setor</option>
                  {DEPARTAMENTOS.filter(d => d.id !== 'todos').map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.icone} {dept.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  color: '#f1f5f9',
                  marginBottom: '8px',
                  fontWeight: '600',
                  fontSize: '14px'
                }}>
                  Observações para o Banco de Talentos
                </label>
                <textarea
                  value={observacoesTalentos}
                  onChange={(e) => setObservacoesTalentos(e.target.value)}
                  placeholder="Por que este candidato tem potencial?"
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(71, 85, 105, 0.4)',
                    borderRadius: '8px',
                    color: '#f1f5f9',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </>
          )}

          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '28px'
          }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={enviando}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: 'rgba(71, 85, 105, 0.3)',
                color: '#f1f5f9',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                borderRadius: '10px',
                cursor: enviando ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                opacity: enviando ? 0.5 : 1
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              style={{
                flex: 1,
                padding: '14px',
                backgroundColor: enviando ? '#9ca3af' : '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: enviando ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: '700',
                opacity: enviando ? 0.6 : 1,
                boxShadow: enviando ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
            >
              {enviando ? '⏳ Processando...' : '❌ Reprovar'}
            </button>
          </div>
        </form>
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

// Card de Candidato Arrastável - SEMPRE DARK
function CardCandidato({ candidato, onCandidatoClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: candidato.id,
    data: { candidato }
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onCandidatoClick(candidato)}
    >
      <div style={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '10px',
        padding: '14px',
        marginBottom: '10px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
        transition: 'all 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = '#475569';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.2)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = '#334155';
      }}
      >
        <div style={{
          color: '#f8fafc',
          fontWeight: 'bold',
          fontSize: '14px',
          marginBottom: '6px'
        }}>
          {candidato.nome_completo}
        </div>
        <div style={{
          color: '#94a3b8',
          fontSize: '12px',
          marginBottom: '8px'
        }}>
          💼 {candidato.cargo_pretendido}
        </div>
        {candidato.telefone && (
          <div style={{
            color: '#64748b',
            fontSize: '11px'
          }}>
            📱 {candidato.telefone}
          </div>
        )}
      </div>
    </div>
  );
}

// Coluna do Kanban - SEMPRE DARK
function ColunaKanban({ etapa, candidatos, onCandidatoClick }) {
  const { setNodeRef, isOver } = useDroppable({
    id: etapa.id,
    data: { etapaId: etapa.id }
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        backgroundColor: isOver ? 'rgba(59, 130, 246, 0.1)' : '#0f172a',
        border: `2px solid ${isOver ? etapa.cor : '#334155'}`,
        borderRadius: '12px',
        padding: '16px',
        minHeight: '400px',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 style={{
          color: '#f8fafc',
          fontSize: '16px',
          fontWeight: '700',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>{etapa.icone}</span>
          {etapa.nome}
        </h3>
        <span style={{
          backgroundColor: etapa.cor,
          color: 'white',
          borderRadius: '12px',
          padding: '4px 10px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {candidatos.length}
        </span>
      </div>

      <div>
        {candidatos.map(candidato => (
          <CardCandidato
            key={candidato.id}
            candidato={candidato}
            onCandidatoClick={onCandidatoClick}
          />
        ))}
      </div>
    </div>
  );
}

// Componente Principal
export default function KanbanCandidatos() {
  const [candidatosPorEtapa, setCandidatosPorEtapa] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [departamentoFiltro, setDepartamentoFiltro] = useState('todos');
  const [activeId, setActiveId] = useState(null);
  const [activeCandidato, setActiveCandidato] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [candidatoSelecionado, setCandidatoSelecionado] = useState(null);
  const [modalReprovacao, setModalReprovacao] = useState({
    isOpen: false,
    candidato: null,
    etapaOrigem: null
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  );

  useEffect(() => {
    fetchCandidatos();
  }, [departamentoFiltro]);

  const fetchCandidatos = async () => {
    setCarregando(true);
    try {
      let query = supabase
        .from('candidatos')
        .select('*')
        .not('etapa_atual', 'is', null)
        .or('banco_talentos.is.null,banco_talentos.eq.false');

      if (departamentoFiltro !== 'todos') {
        query = query.eq('setor_interesse', departamentoFiltro);
      }

      const { data, error } = await query;

      if (error) throw error;

      const agrupados = {};
      ETAPAS.forEach(etapa => {
        agrupados[etapa.id] = data?.filter(c => c.etapa_atual === etapa.id) || [];
      });

      setCandidatosPorEtapa(agrupados);
    } catch (error) {
      handleError(error, 'Erro ao carregar candidatos');
    } finally {
      setCarregando(false);
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
    
    const candidato = active.data.current?.candidato;
    setActiveCandidato(candidato);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    setActiveId(null);
    setActiveCandidato(null);

    if (!over) return;

    const candidatoId = active.id;
    const novaEtapaId = over.id;
    const candidato = active.data.current?.candidato;

    if (!candidato) return;

    const etapaAtual = candidato.etapa_atual;

    if (etapaAtual === novaEtapaId) return;

    if (novaEtapaId === 'reprovado') {
      setModalReprovacao({
        isOpen: true,
        candidato,
        etapaOrigem: etapaAtual
      });
      return;
    }

    const novoCandidatosPorEtapa = { ...candidatosPorEtapa };
    novoCandidatosPorEtapa[etapaAtual] = novoCandidatosPorEtapa[etapaAtual].filter(
      c => c.id !== candidatoId
    );
    novoCandidatosPorEtapa[novaEtapaId] = [
      ...novoCandidatosPorEtapa[novaEtapaId],
      { ...candidato, etapa_atual: novaEtapaId }
    ];
    
    setCandidatosPorEtapa(novoCandidatosPorEtapa);

    try {
      await supabase
        .from('etapas_candidato')
        .insert({
          candidato_id: candidatoId,
          etapa: novaEtapaId,
          status: 'em_andamento'
        });

      await supabase
        .from('candidatos')
        .update({ etapa_atual: novaEtapaId })
        .eq('id', candidatoId);

      if (novaEtapaId === 'aprovado') {
        await supabase
          .from('candidatos')
          .update({ status: 'contratado' })
          .eq('id', candidatoId);
      }

      const etapaInfo = ETAPAS.find(e => e.id === novaEtapaId);
      showSuccess(`${etapaInfo.icone} Candidato movido para: ${etapaInfo.nome}`);

    } catch (err) {
      handleError(err, 'Erro ao mover candidato');
      fetchCandidatos();
    }
  };

  const handleConfirmarReprovacao = async (dados) => {
    const { candidato } = modalReprovacao;
    const { motivoReprovacao, adicionarTalentos, setorTalentos, observacoesTalentos } = dados;

    try {
      if (adicionarTalentos) {
        await supabase
          .from('historico_candidatos')
          .insert({
            candidato_id: candidato.id,
            nome_completo: candidato.nome_completo,
            telefone: candidato.telefone || null,
            cpf: candidato.cpf || null,
            email: candidato.Email,
            cargo_pretendido: candidato.cargo_pretendido,
            vaga_id: candidato.vaga_id || null,
            status_final: 'banco_talentos',
            etapa_final: candidato.etapa_atual,
            observacoes: observacoesTalentos || motivoReprovacao,
            data_inscricao: candidato.created_at,
            setor_interesse: setorTalentos
          });

        await supabase
          .from('candidatos')
          .update({
            etapa_atual: 'reprovado',
            status: 'dispensado',
            banco_talentos: true,
            setor_interesse: setorTalentos,
            observacoes_talentos: observacoesTalentos || motivoReprovacao
          })
          .eq('id', candidato.id);

        showSuccess('✅ Candidato reprovado e adicionado ao Banco de Talentos!');
      } else {
        await supabase
          .from('historico_candidatos')
          .insert({
            candidato_id: candidato.id,
            nome_completo: candidato.nome_completo,
            telefone: candidato.telefone || null,
            cpf: candidato.cpf || null,
            email: candidato.Email,
            cargo_pretendido: candidato.cargo_pretendido,
            vaga_id: candidato.vaga_id || null,
            status_final: 'reprovado',
            etapa_final: candidato.etapa_atual,
            observacoes: motivoReprovacao,
            data_inscricao: candidato.created_at
          });

        await supabase
          .from('candidatos')
          .delete()
          .eq('id', candidato.id);

        showSuccess('✅ Candidato reprovado e movido para o histórico.');
      }

      await fetchCandidatos();
    } catch (error) {
      handleError(error, 'Erro ao processar reprovação');
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveCandidato(null);
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
        <div className="spinner"></div>
        <p style={{ 
          color: '#94a3b8',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Carregando pipeline...
        </p>
      </div>
    );
  }

  const totalCandidatos = Object.values(candidatosPorEtapa).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <div style={{ padding: '20px' }}>
      {/* Header - USA VARIÁVEIS DO TEMA */}
      <div style={{ 
        marginBottom: '24px',
        padding: '20px 24px',
        background: 'var(--gradient-secondary)',
        borderRadius: '14px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h2 style={{ 
              color: 'var(--text-primary)', 
              marginBottom: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              fontSize: '22px',
              fontWeight: '700'
            }}>
              🎯 Pipeline de Candidatos
            </h2>
            <p style={{ 
              color: 'var(--text-tertiary)', 
              fontSize: '14px', 
              margin: 0
            }}>
              👆 Arraste os cards para mover candidatos entre as etapas • {totalCandidatos} candidatos
            </p>
          </div>

          {/* Filtro de Departamentos */}
          <select
            value={departamentoFiltro}
            onChange={(e) => setDepartamentoFiltro(e.target.value)}
            style={{
              padding: '10px 16px',
              backgroundColor: '#334155',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: '220px'
            }}
          >
            {DEPARTAMENTOS.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.icone} {dept.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* PIPELINE - SEMPRE DARK */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(280px, 1fr))',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '20px'
        }}>
          {ETAPAS.map(etapa => (
            <ColunaKanban
              key={etapa.id}
              etapa={etapa}
              candidatos={candidatosPorEtapa[etapa.id] || []}
              onCandidatoClick={(candidato) => {
                setCandidatoSelecionado(candidato);
                setModalAberto(true);
              }}
            />
          ))}
        </div>

        <DragOverlay>
          {activeId && activeCandidato ? (
            <div style={{
              background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
              backdropFilter: 'blur(10px)',
              border: '2px solid #3b82f6',
              borderRadius: '10px',
              padding: '14px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              cursor: 'grabbing',
              opacity: 0.95
            }}>
              <div style={{
                color: '#f8fafc',
                fontWeight: 'bold',
                fontSize: '14px',
                marginBottom: '5px'
              }}>
                {activeCandidato.nome_completo}
              </div>
              <div style={{
                color: '#94a3b8',
                fontSize: '12px'
              }}>
                💼 {activeCandidato.cargo_pretendido}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {modalAberto && candidatoSelecionado && (
        <ModalDetalhesEtapa
          candidato={candidatoSelecionado}
          isOpen={modalAberto}
          onClose={() => {
            setModalAberto(false);
            setCandidatoSelecionado(null);
          }}
          onAtualizar={fetchCandidatos}
        />
      )}

      <ModalReprovacao
        isOpen={modalReprovacao.isOpen}
        onClose={() => setModalReprovacao({ isOpen: false, candidato: null, etapaOrigem: null })}
        onConfirm={handleConfirmarReprovacao}
        candidato={modalReprovacao.candidato}
      />

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