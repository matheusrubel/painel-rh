import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import ModalDetalhesEtapa from './ModalDetalhesEtapa';
import { showSuccess, showError } from '../utils/toast';
import { handleError } from '../utils/errorHandler';
import { useTheme } from '../contexts/ThemeContext'; // ✅ NOVO
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

// ========== MODAL DE REPROVAÇÃO (DESIGN MODERNO E SUAVE) ==========
function ModalReprovacao({ isOpen, onClose, onConfirm, candidato }) {
  const { colors } = useTheme(); // ✅ ADICIONAR ISSO
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
          backgroundColor: colors.bg.secondary,
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: colors.shadow.lg,
          border: `1px solid rgba(239, 68, 68, 0.3)`,
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
            color: colors.text.primary,
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
              color: colors.text.secondary,
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              transition: 'all 0.2s ease',
              fontWeight: '300'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(148, 163, 184, 0.2)';
              e.target.style.transform = 'rotate(90deg)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(148, 163, 184, 0.1)';
              e.target.style.transform = 'rotate(0deg)';
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          background: colors.bg.tertiary,
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '28px',
          border: `1px solid ${colors.border.primary}`,
          boxShadow: colors.shadow.sm
        }}>
          <p style={{ 
            color: colors.text.primary, 
            margin: '0 0 8px 0', 
            fontWeight: '600',
            fontSize: '16px',
            letterSpacing: '-0.01em'
          }}>
            {candidato?.nome_completo}
          </p>
          <p style={{ 
            color: colors.text.tertiary, 
            margin: 0, 
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            💼 {candidato?.cargo_pretendido || 'Cargo não informado'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              color: colors.text.primary, 
              marginBottom: '10px',
              fontWeight: '600',
              fontSize: '14px',
              letterSpacing: '-0.01em'
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
                color: colors.text.primary,
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ef4444';
                e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(71, 85, 105, 0.4)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.03) 100%)',
            padding: '18px',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            transition: 'all 0.2s ease'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              color: colors.text.primary,
              fontSize: '15px',
              fontWeight: '600'
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⭐ Adicionar ao Banco de Talentos
              </span>
            </label>
            <p style={{ 
              color: colors.text.tertiary, 
              fontSize: '13px', 
              margin: '10px 0 0 32px',
              lineHeight: '1.5'
            }}>
              Guardar este candidato para oportunidades futuras
            </p>
          </div>

          {adicionarTalentos && (
            <div style={{ 
              marginBottom: '24px',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <label style={{ 
                display: 'block', 
                color: colors.text.primary, 
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Setor de Interesse <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={setorTalentos}
                onChange={(e) => setSetorTalentos(e.target.value)}
                required={adicionarTalentos}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(71, 85, 105, 0.4)',
                  borderRadius: '10px',
                  color: colors.text.primary,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(71, 85, 105, 0.4)'}
              >
                <option value="">Selecione o setor</option>
                <option value="Contabilidade">📊 Contabilidade</option>
                <option value="Fiscal">💰 Fiscal</option>
                <option value="RH">👥 RH</option>
                <option value="TI">💻 TI</option>
                <option value="Administrativo">📋 Administrativo</option>
                <option value="Financeiro">💵 Financeiro</option>
                <option value="Comercial">📈 Comercial</option>
                <option value="Atendimento">📞 Atendimento</option>
                <option value="Outro">📌 Outro</option>
              </select>
            </div>
          )}

          {adicionarTalentos && (
            <div style={{ 
              marginBottom: '24px',
              animation: 'fadeIn 0.3s ease-out 0.1s both'
            }}>
              <label style={{ 
                display: 'block', 
                color: colors.text.primary, 
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Observações <span style={{ color: colors.text.muted, fontWeight: '400' }}>(opcional)</span>
              </label>
              <textarea
                value={observacoesTalentos}
                onChange={(e) => setObservacoesTalentos(e.target.value)}
                placeholder="Habilidades, experiências relevantes..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(71, 85, 105, 0.4)',
                  borderRadius: '10px',
                  color: colors.text.primary,
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#10b981';
                  e.target.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(71, 85, 105, 0.4)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          )}

          {!adicionarTalentos && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(69, 10, 10, 0.4) 0%, rgba(69, 10, 10, 0.2) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '16px 18px',
              marginBottom: '24px',
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              <p style={{ 
                color: colors.status.error, 
                margin: 0,
                fontSize: '13px',
                lineHeight: '1.6',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
                <span>
                  <strong>Atenção:</strong> Sem adicionar ao Banco de Talentos, 
                  o candidato será <strong>deletado permanentemente</strong> do sistema.
                </span>
              </p>
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'flex-end',
            paddingTop: '8px'
          }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={enviando}
              style={{
                padding: '12px 28px',
                background: 'rgba(71, 85, 105, 0.3)',
                color: colors.text.primary,
                border: '1px solid rgba(71, 85, 105, 0.5)',
                borderRadius: '10px',
                cursor: enviando ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                opacity: enviando ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!enviando) {
                  e.target.style.background = 'rgba(71, 85, 105, 0.5)';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(71, 85, 105, 0.3)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              style={{
                padding: '12px 28px',
                background: enviando 
                  ? 'rgba(148, 163, 184, 0.3)' 
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: enviando ? 'not-allowed' : 'pointer',
                fontWeight: '700',
                fontSize: '14px',
                opacity: enviando ? 0.6 : 1,
                transition: 'all 0.2s ease',
                boxShadow: enviando ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!enviando) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
              }}
            >
              {enviando ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  Processando...
                </span>
              ) : '❌ Confirmar Reprovação'}
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ========== CARD DRAGGABLE (DESIGN MODERNO E SUAVE) ==========
function CandidatoCard({ candidato, onClick }) {
  const { colors } = useTheme(); // ✅ Usar cores do tema
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: candidato.id
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0 : 1,
    background: isDragging 
      ? 'linear-gradient(135deg, #475569 0%, #334155 100%)'
      : colors.bg.card, // ✅ Cor do tema
    backdropFilter: 'blur(10px)',
    border: `1px solid ${colors.border.secondary}`, // ✅ Cor do tema
    borderRadius: '10px',
    padding: '14px',
    cursor: isDragging ? 'grabbing' : 'grab',
    marginBottom: '10px',
    transition: isDragging ? 'none' : 'all 0.2s ease',
    touchAction: 'none',
    boxShadow: isDragging 
      ? 'none'
      : colors.shadow.sm // ✅ Sombra do tema
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
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onMouseEnter={(e) => {
          if (!isDragging) {
            e.currentTarget.style.borderColor = colors.status.info; // ✅ Cor do tema
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            e.currentTarget.style.borderColor = colors.border.secondary; // ✅ Cor do tema
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        <div onClick={(e) => {
          e.stopPropagation();
          onClick(candidato);
        }}>
          <div style={{
            color: colors.text.primary, // ✅ Cor do tema
            fontWeight: '600',
            fontSize: '14px',
            marginBottom: '6px',
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {candidato.nome_completo}
            {/* ✅ TAG COMPACTA DE HISTÓRICO */}
            {candidato.historico_anterior && candidato.historico_anterior.length > 0 && (
              <span
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  fontSize: '9px',
                  fontWeight: 'bold',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  boxShadow: '0 1px 4px rgba(245, 158, 11, 0.3)'
                }}
                title="Este candidato já participou de processos anteriores"
              >
                🔄 {candidato.historico_anterior.length}x
              </span>
            )}
          </div>

          <div style={{
            color: colors.text.tertiary, // ✅ Cor do tema
            fontSize: '12px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            💼 {candidato.cargo_pretendido}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
            color: colors.text.muted // ✅ Cor do tema
          }}>
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              padding: '3px 8px',
              background: colors.bg.hover, // ✅ Cor do tema
              borderRadius: '6px'
            }}>
              ⏱️ {calcularTempoNaEtapa(candidato.etapaAtual?.data_inicio)}
            </span>
            {candidato.etapaAtual?.score && (
              <span style={{
                background: candidato.etapaAtual.score >= 70 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                  : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '11px',
                boxShadow: colors.shadow.sm // ✅ Sombra do tema
              }}>
                ⭐ {candidato.etapaAtual.score}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ========== COLUNA DROPPABLE COM ALTURA FIXA E SCROLL ==========
function ColunaKanban({ etapa, candidatos, onCandidatoClick }) {
  const { colors } = useTheme(); // ✅ ADICIONAR
  const { setNodeRef, isOver } = useDroppable({
    id: etapa.id
  });

  return (
    <div
      style={{
        background: isOver 
          ? `linear-gradient(135deg, rgba(${parseInt(etapa.cor.slice(1,3), 16)}, ${parseInt(etapa.cor.slice(3,5), 16)}, ${parseInt(etapa.cor.slice(5,7), 16)}, 0.15) 0%, ${colors.bg.tertiary} 100%)`
          : colors.bg.secondary,
        backdropFilter: 'blur(10px)',
        border: `2px solid ${isOver ? etapa.cor : colors.border.primary}`,
        borderRadius: '14px',
        height: '480px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isOver 
          ? `0 8px 24px rgba(${parseInt(etapa.cor.slice(1,3), 16)}, ${parseInt(etapa.cor.slice(3,5), 16)}, ${parseInt(etapa.cor.slice(5,7), 16)}, 0.3)`
          : '0 4px 12px rgba(0, 0, 0, 0.2)'
      }}
    >
      {/* Header da Coluna - Fixo no topo */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px',
        borderBottom: `2px solid ${etapa.cor}`,
        background: `linear-gradient(90deg, ${etapa.cor}15 0%, transparent 100%)`,
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        flexShrink: 0 // ✅ Não encolhe
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ 
            fontSize: '22px',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
          }}>
            {etapa.icone}
          </span>
          <span style={{ 
            color: colors.text.primary, 
            fontWeight: '700', 
            fontSize: '14px',
            letterSpacing: '-0.02em'
          }}>
            {etapa.nome}
          </span>
        </div>
        <span style={{
          background: `linear-gradient(135deg, ${etapa.cor} 0%, ${etapa.cor}dd 100%)`,
          color: 'white',
          padding: '4px 10px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: `0 2px 8px ${etapa.cor}40`,
          minWidth: '28px',
          textAlign: 'center'
        }}>
          {candidatos.length}
        </span>
      </div>

      {/* Área dos Cards com Scroll - ✅ AQUI ESTÁ A MUDANÇA PRINCIPAL */}
      <div 
        ref={setNodeRef}
        style={{ 
          flex: 1, // ✅ Ocupa o espaço restante
          overflowY: 'auto', // ✅ SCROLL VERTICAL
          overflowX: 'hidden',
          padding: '14px',
          // ✅ Customização da scrollbar (opcional, para browsers Webkit)
          scrollbarWidth: 'thin', // Firefox
          scrollbarColor: `${etapa.cor} rgba(30, 41, 59, 0.3)`, // Firefox
        }}
        // ✅ CSS para Webkit (Chrome, Safari, Edge)
        className="kanban-scroll"
      >
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
            padding: '40px 10px',
            color: colors.text.muted,
            fontSize: '13px',
            background: colors.bg.primary,
            borderRadius: '10px',
            border: `2px dashed ${colors.border.secondary}`,
            marginTop: '10px'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>
              📭
            </div>
            <div>Nenhum candidato</div>
            <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.7 }}>
              Arraste cards para cá
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ========== COMPONENTE PRINCIPAL ==========
export default function KanbanCandidatos() {
  const { colors } = useTheme(); // ✅ Usar cores do tema
  const [candidatosPorEtapa, setCandidatosPorEtapa] = useState({});
  const [candidatosPorEtapaOriginal, setCandidatosPorEtapaOriginal] = useState({}); // ✅ NOVO: guardar dados originais
  const [carregando, setCarregando] = useState(true);
  const [candidatoSelecionado, setCandidatoSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [activeCandidato, setActiveCandidato] = useState(null);
  
  // ✅ NOVO: Estados de filtro
  const [filtros, setFiltros] = useState({
    pesquisa: '',
    vaga: ''
  });
  
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

      // ✅ NOVO: Buscar histórico para cada candidato
      const candidatosComHistorico = await Promise.all(
        candidatos?.map(async (candidato) => {
          // Buscar no histórico por nome E telefone
          const { data: historicos } = await supabase
            .from('historico_candidatos')
            .select('*')
            .or(`nome_completo.ilike.%${candidato.nome_completo}%,telefone.eq.${candidato.telefone}`)
            .order('data_inscricao', { ascending: false });

          return {
            ...candidato,
            historico_anterior: historicos && historicos.length > 0 ? historicos : null
          };
        }) || []
      );

      const porEtapa = {};
      ETAPAS.forEach(etapa => {
        porEtapa[etapa.id] = [];
      });

      candidatosComHistorico?.forEach(candidato => {
        // ✅ CORRIGIDO: Usar etapa_atual do candidato, não a última do array
        const etapaId = candidato.etapa_atual || 'triagem';
        const etapaAtual = candidato.etapas?.find(e => e.etapa === etapaId) || candidato.etapas?.[candidato.etapas.length - 1];
        
        if (porEtapa[etapaId]) {
          porEtapa[etapaId].push({
            ...candidato,
            etapaAtual: etapaAtual
          });
        }
      });

      setCandidatosPorEtapaOriginal(porEtapa); // ✅ NOVO: Guardar original
      setCandidatosPorEtapa(porEtapa);
    } catch (err) {
      handleError(err, 'Erro ao carregar pipeline');
    }
    setCarregando(false);
  };

  // ✅ NOVO: Função de filtro
  const aplicarFiltros = () => {
    const { pesquisa, vaga } = filtros;
    
    // Se não há filtros, mostrar todos
    if (!pesquisa && !vaga) {
      setCandidatosPorEtapa(candidatosPorEtapaOriginal);
      return;
    }

    const filtrado = {};
    ETAPAS.forEach(e => {
      filtrado[e.id] = [];
    });

    // Filtrar em cada etapa
    Object.keys(candidatosPorEtapaOriginal).forEach(etapaId => {
      const candidatos = candidatosPorEtapaOriginal[etapaId];
      
      const candidatosFiltrados = candidatos.filter(candidato => {
        // Filtro de pesquisa (nome, email, telefone)
        const matchPesquisa = !pesquisa || 
          candidato.nome_completo?.toLowerCase().includes(pesquisa.toLowerCase()) ||
          candidato.email?.toLowerCase().includes(pesquisa.toLowerCase()) ||
          candidato.telefone?.includes(pesquisa);
        
        // Filtro de vaga
        const matchVaga = !vaga || 
          candidato.cargo_pretendido?.toLowerCase().includes(vaga.toLowerCase());
        
        return matchPesquisa && matchVaga;
      });
      
      filtrado[etapaId] = candidatosFiltrados;
    });

    setCandidatosPorEtapa(filtrado);
  };

  // ✅ NOVO: Aplicar filtros quando mudarem
  useEffect(() => {
    aplicarFiltros();
  }, [filtros, candidatosPorEtapaOriginal]);

  // ✅ NOVO: Limpar filtros
  const limparFiltros = () => {
    setFiltros({
      pesquisa: '',
      vaga: ''
    });
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

      const etapaInfo = ETAPAS.find(e => e.id === novaEtapaId);
      showSuccess(`${etapaInfo.icone} Candidato movido para: ${etapaInfo.nome}`);

    } catch (err) {
      handleError(err, 'Erro ao mover candidato');
      fetchCandidatos();
    }
  };

  const handleConfirmarReprovacao = async (dados) => {
    const { candidato, etapaOrigem } = modalReprovacao;
    const { motivoReprovacao, adicionarTalentos, setorTalentos, observacoesTalentos } = dados;

    try {
      // ✅ SEMPRE salvar o histórico da etapa de reprovação
      await supabase
        .from('etapas_candidato')
        .insert({
          candidato_id: candidato.id,
          etapa: 'reprovado',
          status: 'concluido',
          observacoes: motivoReprovacao
        });

      if (adicionarTalentos) {
        // Se adicionar ao banco de talentos, atualizar o candidato
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

        // ✅ Salvar no histórico como "banco_talentos"
        await supabase
          .from('historico_candidatos')
          .insert({
            nome_completo: candidato.nome_completo,
            email: candidato.email,
            telefone: candidato.telefone,
            cargo_pretendido: candidato.cargo_pretendido,
            data_inscricao: candidato.criado_em,
            status_final: 'banco_talentos',
            score: candidato.score,
            observacoes: motivoReprovacao
          });

        showSuccess('✅ Candidato reprovado e adicionado ao Banco de Talentos!');
      } else {
        // ✅ Se NÃO adicionar ao banco, salvar no histórico como "reprovado"
        await supabase
          .from('historico_candidatos')
          .insert({
            nome_completo: candidato.nome_completo,
            email: candidato.email,
            telefone: candidato.telefone,
            cargo_pretendido: candidato.cargo_pretendido,
            data_inscricao: candidato.criado_em,
            status_final: 'reprovado',
            score: candidato.score,
            observacoes: motivoReprovacao
          });

        // Depois deletar o candidato
        await supabase
          .from('candidatos')
          .delete()
          .eq('id', candidato.id);

        showSuccess('✅ Candidato reprovado e removido do sistema.');
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
        <div style={{
          width: '48px',
          height: '48px',
          border: `4px solid ${colors.border.light}`,
          borderTopColor: colors.status.warning,
          borderRadius: '50%',
          animation: 'spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite'
        }}></div>
        <p style={{ 
          color: colors.text.tertiary,
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Carregando pipeline...
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* ✅ BARRA DE FILTROS */}
      <div style={{
        background: colors.bg.card,
        padding: '20px',
        borderRadius: '12px',
        border: `1px solid ${colors.border.primary}`,
        marginBottom: '20px',
        boxShadow: colors.shadow.sm
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px'
        }}>
          <span style={{ 
            fontSize: '20px',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
          }}>
            🔍
          </span>
          <h3 style={{
            color: colors.text.primary,
            margin: 0,
            fontSize: '16px',
            fontWeight: '600'
          }}>
            Filtrar Candidatos
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.5fr auto',
          gap: '12px',
          alignItems: 'end'
        }}>
          {/* Pesquisa Geral */}
          <div>
            <label style={{
              display: 'block',
              color: colors.text.secondary,
              fontSize: '13px',
              marginBottom: '6px',
              fontWeight: '500'
            }}>
              🔎 Pesquisar
            </label>
            <input
              type="text"
              placeholder="Nome, email ou telefone..."
              value={filtros.pesquisa}
              onChange={(e) => setFiltros(prev => ({ ...prev, pesquisa: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: colors.bg.secondary,
                border: `1px solid ${colors.border.secondary}`,
                borderRadius: '8px',
                color: colors.text.primary,
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.status.info}
              onBlur={(e) => e.target.style.borderColor = colors.border.secondary}
            />
          </div>

          {/* Filtro por Vaga */}
          <div>
            <label style={{
              display: 'block',
              color: colors.text.secondary,
              fontSize: '13px',
              marginBottom: '6px',
              fontWeight: '500'
            }}>
              💼 Vaga
            </label>
            <input
              type="text"
              placeholder="Ex: Contador, Analista..."
              value={filtros.vaga}
              onChange={(e) => setFiltros(prev => ({ ...prev, vaga: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                background: colors.bg.secondary,
                border: `1px solid ${colors.border.secondary}`,
                borderRadius: '8px',
                color: colors.text.primary,
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = colors.status.info}
              onBlur={(e) => e.target.style.borderColor = colors.border.secondary}
            />
          </div>

          {/* Botão Limpar */}
          <button
            onClick={limparFiltros}
            disabled={!filtros.pesquisa && !filtros.vaga}
            style={{
              padding: '10px 20px',
              background: filtros.pesquisa || filtros.vaga
                ? colors.status.warning
                : colors.bg.hover,
              color: filtros.pesquisa || filtros.vaga
                ? 'white'
                : colors.text.muted,
              border: 'none',
              borderRadius: '8px',
              cursor: filtros.pesquisa || filtros.vaga ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: filtros.pesquisa || filtros.vaga ? 1 : 0.5
            }}
            onMouseEnter={(e) => {
              if (filtros.pesquisa || filtros.vaga) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = colors.shadow.md;
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            🗑️ Limpar
          </button>
        </div>

        {/* Contador de resultados */}
        {(filtros.pesquisa || filtros.vaga) && (
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: colors.bg.hover,
            borderRadius: '6px',
            border: `1px solid ${colors.border.light}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>ℹ️</span>
            <span style={{
              color: colors.text.tertiary,
              fontSize: '13px'
            }}>
              Mostrando {Object.values(candidatosPorEtapa).flat().length} candidato(s)
            </span>
          </div>
        )}
      </div>

      <div style={{ 
        marginBottom: '24px',
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
        borderRadius: '14px',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <h2 style={{ 
          color: colors.text.primary,
          marginBottom: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          fontSize: '22px',
          fontWeight: '700',
          letterSpacing: '-0.02em'
        }}>
          🎯 Pipeline de Candidatos
        </h2>
        <p style={{ 
          color: colors.text.tertiary,
          fontSize: '14px', 
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ fontSize: '16px' }}>👆</span>
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
              background: colors.bg.tertiary,
              backdropFilter: 'blur(10px)',
              border: '2px solid #3b82f6',
              borderRadius: '10px',
              padding: '14px',
              boxShadow: 'none',
              cursor: 'grabbing',
              opacity: 0.95
            }}>
              <div style={{
                color: colors.text.primary,
                fontWeight: 'bold',
                fontSize: '14px',
                marginBottom: '5px'
              }}>
                {activeCandidato.nome_completo}
              </div>
              <div style={{
                color: colors.text.tertiary,
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

      {/* ✅ CSS GLOBAL COM SCROLLBAR CUSTOMIZADA */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        /* ✅ SCROLLBAR CUSTOMIZADA (Webkit: Chrome, Safari, Edge) */
        .kanban-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .kanban-scroll::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.3);
          border-radius: 10px;
        }
        .kanban-scroll::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.6);
          border-radius: 10px;
          transition: background 0.2s ease;
        }
        .kanban-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 0.8);
        }
      `}</style>
    </div>
  );
}