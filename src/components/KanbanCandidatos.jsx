import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import ModalDetalhesEtapa from './ModalDetalhesEtapa';
import { showSuccess, showError } from '../utils/toast'; // ✅ NOVO
import { handleError } from '../utils/errorHandler'; // ✅ NOVO
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
  const [motivoReprovacao, setMotivoReprovacao] = useState('');
  const [adicionarTalentos, setAdicionarTalentos] = useState(false);
  const [setorTalentos, setSetorTalentos] = useState('');
  const [observacoesTalentos, setObservacoesTalentos] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!motivoReprovacao.trim()) {
      showError('⚠️ O motivo da reprovação é obrigatório!'); // ✅ MUDOU
      return;
    }

    if (adicionarTalentos && !setorTalentos) {
      showError('⚠️ Selecione o setor de interesse para o Banco de Talentos!'); // ✅ MUDOU
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
        backdropFilter: 'blur(8px)', // ✅ NOVO: Blur suave
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out' // ✅ NOVO: Animação suave
      }}
      onClick={handleClose}
    >
      <div 
        style={{
          backgroundColor: '#1e293b',
          borderRadius: '16px', // ✅ Mais arredondado
          padding: '32px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)', // ✅ Sombra mais suave
          border: '1px solid rgba(239, 68, 68, 0.3)', // ✅ Borda mais suave
          animation: 'slideUp 0.3s ease-out' // ✅ NOVO: Animação de entrada
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
            color: '#f8fafc', // ✅ Cor mais suave
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
              background: 'rgba(239, 68, 68, 0.15)', // ✅ Background suave
              fontSize: '20px'
            }}>
              ❌
            </span>
            Reprovar Candidato
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'rgba(148, 163, 184, 0.1)', // ✅ Background suave
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
              transition: 'all 0.2s ease',
              fontWeight: '300'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(148, 163, 184, 0.2)';
              e.target.style.transform = 'rotate(90deg)'; // ✅ Rotação suave
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(148, 163, 184, 0.1)';
              e.target.style.transform = 'rotate(0deg)';
            }}
          >
            ×
          </button>
        </div>

        {/* Card do Candidato - Design Moderno */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)', // ✅ Gradiente suave
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '28px',
          border: '1px solid rgba(71, 85, 105, 0.3)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' // ✅ Sombra interna suave
        }}>
          <p style={{ 
            color: '#f8fafc', 
            margin: '0 0 8px 0', 
            fontWeight: '600',
            fontSize: '16px',
            letterSpacing: '-0.01em'
          }}>
            {candidato?.nome_completo}
          </p>
          <p style={{ 
            color: '#94a3b8', 
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
          {/* Motivo da Reprovação */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              color: '#f1f5f9', 
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
                backgroundColor: 'rgba(15, 23, 42, 0.6)', // ✅ Background suave
                border: '1px solid rgba(71, 85, 105, 0.4)',
                borderRadius: '10px',
                color: '#f1f5f9',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ef4444';
                e.target.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)'; // ✅ Glow suave
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(71, 85, 105, 0.4)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Checkbox Banco de Talentos - Design Premium */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.03) 100%)', // ✅ Gradiente sutil
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
              color: '#f8fafc',
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
                  accentColor: '#f59e0b' // ✅ Cor moderna
                }}
              />
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⭐ Adicionar ao Banco de Talentos
              </span>
            </label>
            <p style={{ 
              color: '#94a3b8', 
              fontSize: '13px', 
              margin: '10px 0 0 32px',
              lineHeight: '1.5'
            }}>
              Guardar este candidato para oportunidades futuras
            </p>
          </div>

          {/* Setor de Interesse (condicional) - Animação Suave */}
          {adicionarTalentos && (
            <div style={{ 
              marginBottom: '24px',
              animation: 'fadeIn 0.3s ease-out' // ✅ Animação de entrada
            }}>
              <label style={{ 
                display: 'block', 
                color: '#f1f5f9', 
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
                  color: '#f1f5f9',
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

          {/* Observações (condicional) */}
          {adicionarTalentos && (
            <div style={{ 
              marginBottom: '24px',
              animation: 'fadeIn 0.3s ease-out 0.1s both' // ✅ Delay na animação
            }}>
              <label style={{ 
                display: 'block', 
                color: '#f1f5f9', 
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Observações <span style={{ color: '#64748b', fontWeight: '400' }}>(opcional)</span>
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
                  color: '#f1f5f9',
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

          {/* Alerta de Exclusão - Design Moderno */}
          {!adicionarTalentos && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(69, 10, 10, 0.4) 0%, rgba(69, 10, 10, 0.2) 100%)', // ✅ Gradiente suave
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '16px 18px',
              marginBottom: '24px',
              animation: 'pulse 2s ease-in-out infinite' // ✅ Pulso suave
            }}>
              <p style={{ 
                color: '#fca5a5', 
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

          {/* Botões - Design Premium */}
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
                background: 'rgba(71, 85, 105, 0.3)', // ✅ Background suave
                color: '#f1f5f9',
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
                  : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', // ✅ Gradiente
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: enviando ? 'not-allowed' : 'pointer',
                fontWeight: '700',
                fontSize: '14px',
                opacity: enviando ? 0.6 : 1,
                transition: 'all 0.2s ease',
                boxShadow: enviando ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.3)' // ✅ Sombra suave
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

      {/* CSS Animations */}
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
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: candidato.id
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.6 : 1,
    background: isDragging 
      ? 'linear-gradient(135deg, #475569 0%, #334155 100%)'
      : 'linear-gradient(135deg, rgba(51, 65, 85, 0.6) 0%, rgba(30, 41, 59, 0.8) 100%)', // ✅ Gradiente suave
    backdropFilter: 'blur(10px)', // ✅ Blur moderno
    border: '1px solid rgba(71, 85, 105, 0.4)',
    borderRadius: '10px',
    padding: '14px',
    cursor: isDragging ? 'grabbing' : 'grab',
    marginBottom: '10px',
    transition: isDragging ? 'none' : 'all 0.2s ease',
    touchAction: 'none',
    boxShadow: isDragging 
      ? '0 10px 30px rgba(0, 0, 0, 0.5)' 
      : '0 2px 8px rgba(0, 0, 0, 0.2)' // ✅ Sombra suave
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
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.3)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.borderColor = 'rgba(71, 85, 105, 0.4)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
        }
      }}
    >
      <div onClick={(e) => {
        e.stopPropagation();
        onClick(candidato);
      }}>
        <div style={{
          color: '#f8fafc',
          fontWeight: '600',
          fontSize: '14px',
          marginBottom: '6px',
          letterSpacing: '-0.01em'
        }}>
          {candidato.nome_completo}
        </div>

        <div style={{
          color: '#94a3b8',
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
          color: '#64748b'
        }}>
          <span style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            padding: '3px 8px',
            background: 'rgba(100, 116, 139, 0.2)',
            borderRadius: '6px'
          }}>
            ⏱️ {calcularTempoNaEtapa(candidato.etapaAtual?.data_inicio)}
          </span>
          {candidato.etapaAtual?.score && (
            <span style={{
              background: candidato.etapaAtual.score >= 70 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // ✅ Gradiente
              color: 'white',
              padding: '4px 8px',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '11px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
            }}>
              ⭐ {candidato.etapaAtual.score}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== COLUNA DROPPABLE (DESIGN PREMIUM) ==========
function ColunaKanban({ etapa, candidatos, onCandidatoClick }) {
  const { setNodeRef, isOver } = useDroppable({
    id: etapa.id
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        background: isOver 
          ? `linear-gradient(135deg, rgba(${parseInt(etapa.cor.slice(1,3), 16)}, ${parseInt(etapa.cor.slice(3,5), 16)}, ${parseInt(etapa.cor.slice(5,7), 16)}, 0.15) 0%, rgba(30, 41, 59, 0.8) 100%)`
          : 'linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%)', // ✅ Gradiente suave
        backdropFilter: 'blur(10px)', // ✅ Blur premium
        border: `2px solid ${isOver ? etapa.cor : 'rgba(51, 65, 85, 0.6)'}`,
        borderRadius: '14px', // ✅ Mais arredondado
        padding: '14px',
        minHeight: '500px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // ✅ Curva suave
        boxShadow: isOver 
          ? `0 8px 24px rgba(${parseInt(etapa.cor.slice(1,3), 16)}, ${parseInt(etapa.cor.slice(3,5), 16)}, ${parseInt(etapa.cor.slice(5,7), 16)}, 0.3)`
          : '0 4px 12px rgba(0, 0, 0, 0.2)'
      }}
    >
      {/* Header da Coluna - Design Premium */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        paddingBottom: '12px',
        borderBottom: `2px solid ${etapa.cor}`,
        background: `linear-gradient(90deg, ${etapa.cor}15 0%, transparent 100%)`, // ✅ Gradiente no header
        marginLeft: '-14px',
        marginRight: '-14px',
        marginTop: '-14px',
        padding: '14px 14px 12px 14px',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ 
            fontSize: '22px',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' // ✅ Sombra no ícone
          }}>
            {etapa.icone}
          </span>
          <span style={{ 
            color: '#f8fafc', 
            fontWeight: '700', 
            fontSize: '14px',
            letterSpacing: '-0.02em'
          }}>
            {etapa.nome}
          </span>
        </div>
        <span style={{
          background: `linear-gradient(135deg, ${etapa.cor} 0%, ${etapa.cor}dd 100%)`, // ✅ Gradiente no badge
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

      {/* Área dos Cards */}
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
            padding: '40px 10px',
            color: '#64748b',
            fontSize: '13px',
            background: 'rgba(15, 23, 42, 0.4)',
            borderRadius: '10px',
            border: '2px dashed rgba(71, 85, 105, 0.3)',
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
      handleError(err, 'Erro ao carregar pipeline'); // ✅ MUDOU
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

      const etapaInfo = ETAPAS.find(e => e.id === novaEtapaId);
      showSuccess(`${etapaInfo.icone} Candidato movido para: ${etapaInfo.nome}`); // ✅ MUDOU

    } catch (err) {
      handleError(err, 'Erro ao mover candidato'); // ✅ MUDOU
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

        showSuccess('✅ Candidato reprovado e adicionado ao Banco de Talentos!'); // ✅ MUDOU
      } else {
        await supabase
          .from('candidatos')
          .delete()
          .eq('id', candidato.id);

        showSuccess('✅ Candidato reprovado e removido do sistema.'); // ✅ MUDOU
      }

      await fetchCandidatos();
    } catch (error) {
      handleError(error, 'Erro ao processar reprovação'); // ✅ MUDOU
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
          border: '4px solid rgba(51, 65, 85, 0.3)',
          borderTopColor: '#f59e0b',
          borderRadius: '50%',
          animation: 'spin 1s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite' // ✅ Curva suave
        }}></div>
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

  return (
    <div style={{ padding: '20px' }}>
      {/* Header Premium */}
      <div style={{ 
        marginBottom: '24px',
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)', // ✅ Gradiente suave
        borderRadius: '14px',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <h2 style={{ 
          color: '#f8fafc', 
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
          color: '#94a3b8', 
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
      `}</style>
    </div>
  );
}
