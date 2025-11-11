import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import ModalDetalhesEtapa from './ModalDetalhesEtapa';
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

// ========== MODAL DE REPROVAÇÃO ==========
function ModalReprovacao({ isOpen, onClose, onConfirm, candidato }) {
  const [motivoReprovacao, setMotivoReprovacao] = useState('');
  const [adicionarTalentos, setAdicionarTalentos] = useState(false);
  const [setorTalentos, setSetorTalentos] = useState('');
  const [observacoesTalentos, setObservacoesTalentos] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!motivoReprovacao.trim()) {
      alert('⚠️ O motivo da reprovação é obrigatório!');
      return;
    }

    if (adicionarTalentos && !setorTalentos) {
      alert('⚠️ Selecione o setor de interesse para o Banco de Talentos!');
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
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={handleClose}
    >
      <div 
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '1px solid #ef4444'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ 
            color: '#ef4444', 
            margin: 0,
            fontSize: '24px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            ❌ Reprovar Candidato
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '28px',
              cursor: 'pointer',
              padding: '0',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          backgroundColor: '#0f172a',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #334155'
        }}>
          <p style={{ color: '#f1f5f9', margin: '0 0 8px 0', fontWeight: '600' }}>
            {candidato?.nome_completo}
          </p>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
            {candidato?.cargo_pretendido || 'Cargo não informado'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              color: '#f1f5f9', 
              marginBottom: '8px',
              fontWeight: '500',
              fontSize: '14px'
            }}>
              Motivo da Reprovação <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              value={motivoReprovacao}
              onChange={(e) => setMotivoReprovacao(e.target.value)}
              placeholder="Descreva o motivo da reprovação (obrigatório)"
              required
              rows="4"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '6px',
                color: '#f1f5f9',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{
            backgroundColor: '#0f172a',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #334155'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              color: '#f1f5f9',
              fontSize: '15px',
              fontWeight: '500'
            }}>
              <input
                type="checkbox"
                checked={adicionarTalentos}
                onChange={(e) => setAdicionarTalentos(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              ⭐ Adicionar ao Banco de Talentos
            </label>
            <p style={{ 
              color: '#94a3b8', 
              fontSize: '13px', 
              margin: '8px 0 0 28px' 
            }}>
              Marque para salvar este candidato para oportunidades futuras
            </p>
          </div>

          {adicionarTalentos && (
            <div style={{
              backgroundColor: '#0f172a',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #10b981'
            }}>
              <h3 style={{ 
                color: '#10b981', 
                margin: '0 0 16px 0',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                📋 Dados para o Banco de Talentos
              </h3>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  color: '#f1f5f9', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Setor de Interesse <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={setorTalentos}
                  onChange={(e) => setSetorTalentos(e.target.value)}
                  required={adicionarTalentos}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#f1f5f9',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Selecione o setor</option>
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

              <div>
                <label style={{ 
                  display: 'block', 
                  color: '#f1f5f9', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Observações (opcional)
                </label>
                <textarea
                  value={observacoesTalentos}
                  onChange={(e) => setObservacoesTalentos(e.target.value)}
                  placeholder="Habilidades, experiências relevantes, etc."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#f1f5f9',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
          )}

          {!adicionarTalentos && (
            <div style={{
              backgroundColor: '#450a0a',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <p style={{ 
                color: '#fca5a5', 
                margin: 0,
                fontSize: '13px',
                lineHeight: '1.5'
              }}>
                ⚠️ <strong>Atenção:</strong> Se não adicionar ao Banco de Talentos, 
                o candidato será <strong>deletado permanentemente</strong> do sistema.
              </p>
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end' 
          }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={enviando}
              style={{
                padding: '12px 24px',
                backgroundColor: '#334155',
                color: '#f1f5f9',
                border: 'none',
                borderRadius: '6px',
                cursor: enviando ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                opacity: enviando ? 0.5 : 1
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: enviando ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                opacity: enviando ? 0.5 : 1
              }}
            >
              {enviando ? 'Processando...' : 'Confirmar Reprovação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente de Card Arrastável
function CandidatoCard({ candidato, onClick }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: candidato.id
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: '#334155',
    border: '1px solid #475569',
    borderRadius: '6px',
    padding: '12px',
    cursor: isDragging ? 'grabbing' : 'grab',
    marginBottom: '10px',
    transition: isDragging ? 'none' : 'transform 0.2s ease',
    touchAction: 'none'
  };

  const calcularTempoNaEtapa = (dataInicio) => {
    if (!dataInicio) return 'N/A';
    const diff = Date.now() - new Date(dataInicio).getTime();
    const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (dias === 0) return 'Hoje';
    if (dias === 1) return '1 dia';
    return `${dias} dias`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <div onClick={(e) => {
        e.stopPropagation();
        onClick(candidato);
      }}>
        <div style={{
          color: '#f8fafc',
          fontWeight: 'bold',
          fontSize: '14px',
          marginBottom: '5px'
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

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: '#64748b'
        }}>
          <span>
            ⏱️ {calcularTempoNaEtapa(candidato.etapaAtual?.data_inicio)}
          </span>
          {candidato.etapaAtual?.score && (
            <span style={{
              backgroundColor: candidato.etapaAtual.score >= 70 ? '#10b981' : '#f59e0b',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}>
              {candidato.etapaAtual.score}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente de Coluna (Droppable)
function ColunaKanban({ etapa, candidatos, onCandidatoClick }) {
  const { setNodeRef, isOver } = useDroppable({
    id: etapa.id
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        backgroundColor: isOver ? '#334155' : '#1e293b',
        border: `2px solid ${isOver ? etapa.cor : '#334155'}`,
        borderRadius: '8px',
        padding: '12px',
        minHeight: '500px',
        transition: 'all 0.3s'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
        paddingBottom: '10px',
        borderBottom: `2px solid ${etapa.cor}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>{etapa.icone}</span>
          <span style={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '14px' }}>
            {etapa.nome}
          </span>
        </div>
        <span style={{
          backgroundColor: etapa.cor,
          color: 'white',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {candidatos.length}
        </span>
      </div>

      <div style={{ minHeight: '400px' }}>
        {candidatos.map((candidato) => (
          <CandidatoCard
            key={candidato.id}
            candidato={candidato}
            onClick={onCandidatoClick}
          />
        ))}
        
        {candidatos.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '30px 10px',
            color: '#64748b',
            fontSize: '13px'
          }}>
            Nenhum candidato nesta etapa
          </div>
        )}
      </div>
    </div>
  );
}

// Componente Principal
export default function KanbanCandidatos() {
  const [candidatosPorEtapa, setCandidatosPorEtapa] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [candidatoSelecionado, setCandidatoSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [activeCandidato, setActiveCandidato] = useState(null);
  
  const [modalReprovacao, setModalReprovacao] = useState({
    isOpen: false,
    candidato: null,
    etapaOrigem: null
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      }
    })
  );

  useEffect(() => {
    fetchCandidatos();
  }, []);

  const fetchCandidatos = async () => {
    setCarregando(true);
    try {
      const { data: candidatos, error } = await supabase
        .from('candidatos')
        .select(`
          *,
          etapas:etapas_candidato(
            id,
            etapa,
            status,
            score,
            observacoes,
            data_inicio,
            data_conclusao
          )
        `)
        .or('banco_talentos.is.null,banco_talentos.eq.false')
        .order('criado_em', { ascending: false });

      if (error) throw error;

      const porEtapa = {};
      ETAPAS.forEach(etapa => {
        porEtapa[etapa.id] = [];
      });

      candidatos?.forEach(candidato => {
        const etapaAtual = candidato.etapas?.[candidato.etapas.length - 1];
        const etapaId = etapaAtual?.etapa || 'triagem';
        
        if (porEtapa[etapaId]) {
          porEtapa[etapaId].push({
            ...candidato,
            etapaAtual: etapaAtual
          });
        }
      });

      setCandidatosPorEtapa(porEtapa);
    } catch (err) {
      console.error('Erro ao buscar candidatos:', err);
      alert('Erro ao carregar pipeline');
    }
    setCarregando(false);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);

    let candidatoAtivo = null;
    for (const candidatos of Object.values(candidatosPorEtapa)) {
      candidatoAtivo = candidatos.find(c => c.id === active.id);
      if (candidatoAtivo) break;
    }
    setActiveCandidato(candidatoAtivo);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveCandidato(null);

    if (!over) return;

    const candidatoId = active.id;
    const novaEtapaId = over.id;

    let etapaAtual = null;
    for (const [etapaId, candidatos] of Object.entries(candidatosPorEtapa)) {
      if (candidatos.some(c => c.id === candidatoId)) {
        etapaAtual = etapaId;
        break;
      }
    }

    if (etapaAtual === novaEtapaId) return;
    if (!ETAPAS.find(e => e.id === novaEtapaId)) return;

    // Se for reprovado, abre o modal
    if (novaEtapaId === 'reprovado') {
      const candidato = candidatosPorEtapa[etapaAtual].find(c => c.id === candidatoId);
      setModalReprovacao({
        isOpen: true,
        candidato,
        etapaOrigem: etapaAtual
      });
      return;
    }

    const novoCandidatosPorEtapa = { ...candidatosPorEtapa };
    const candidato = novoCandidatosPorEtapa[etapaAtual].find(c => c.id === candidatoId);
    
    novoCandidatosPorEtapa[etapaAtual] = novoCandidatosPorEtapa[etapaAtual].filter(c => c.id !== candidatoId);
    novoCandidatosPorEtapa[novaEtapaId] = [...novoCandidatosPorEtapa[novaEtapaId], candidato];
    
    setCandidatosPorEtapa(novoCandidatosPorEtapa);

    try {
      const { error: etapaError } = await supabase
        .from('etapas_candidato')
        .insert({
          candidato_id: candidatoId,
          etapa: novaEtapaId,
          status: 'em_andamento'
        });

      if (etapaError) throw etapaError;

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

      console.log(`✅ Candidato movido de ${etapaAtual} → ${novaEtapaId}`);

    } catch (err) {
      console.error('Erro ao mover candidato:', err);
      alert('Erro ao atualizar pipeline');
      fetchCandidatos();
    }
  };

  const handleConfirmarReprovacao = async (dados) => {
    const { candidato, etapaOrigem } = modalReprovacao;
    const { motivoReprovacao, adicionarTalentos, setorTalentos, observacoesTalentos } = dados;

    try {
      if (adicionarTalentos) {
        await supabase
          .from('etapas_candidato')
          .insert({
            candidato_id: candidato.id,
            etapa: 'reprovado',
            status: 'concluido',
            observacoes: motivoReprovacao
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

        alert('✅ Candidato reprovado e adicionado ao Banco de Talentos!');
      } else {
        await supabase
          .from('candidatos')
          .delete()
          .eq('id', candidato.id);

        alert('✅ Candidato reprovado e removido do sistema.');
      }

      await fetchCandidatos();
    } catch (error) {
      console.error('Erro ao processar reprovação:', error);
      alert('❌ Erro ao processar reprovação');
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
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #334155',
          borderTopColor: '#f59e0b',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ color: '#94a3b8' }}>Carregando pipeline...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#f8fafc', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🎯 Pipeline de Candidatos
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '15px' }}>
          Arraste os cards para mover candidatos entre as etapas
        </p>
      </div>

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
          gap: '15px',
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
              backgroundColor: '#475569',
              border: '2px solid #f59e0b',
              borderRadius: '6px',
              padding: '12px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              cursor: 'grabbing',
              opacity: 0.9
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
