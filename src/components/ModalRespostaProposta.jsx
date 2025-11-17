import { useState } from 'react';
import { supabase } from '../config/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { showSuccess, showError } from '../utils/toast';

export default function ModalRespostaProposta({ candidato, isOpen, onClose, onAtualizar }) {
  const { colors } = useTheme();
  const [carregando, setCarregando] = useState(false);
  const [etapa, setEtapa] = useState('escolher'); // 'escolher' ou 'recusa_detalhes'
  const [observacoesRecusa, setObservacoesRecusa] = useState('');

  const aceitarProposta = async () => {
    setCarregando(true);
    try {
      // ACEITOU: Move para histórico como "aprovado"
      const { error: historicoError } = await supabase
        .from('historico_candidatos')
        .insert([{
          nome_completo: candidato.nome_completo,
          email: candidato.Email,
          telefone: candidato.telefone,
          cpf: candidato.cpf,
          cargo_pretendido: candidato.cargo_pretendido,
          data_inscricao: candidato.criado_em,
          etapa_final: 'aprovado',
          status_final: 'aprovado',
          score: candidato.score || null,
          observacoes: 'Candidato aceitou a proposta de trabalho'
        }]);

      if (historicoError) throw historicoError;

      // Remove da pipeline
      const { error: deleteError } = await supabase
        .from('candidatos')
        .delete()
        .eq('id', candidato.id);

      if (deleteError) throw deleteError;

      showSuccess('🎉 Proposta aceita! Candidato contratado e movido para o histórico.');
      onAtualizar();
      onClose();
    } catch (err) {
      showError('Erro ao registrar resposta: ' + err.message);
    } finally {
      setCarregando(false);
    }
  };

  const recusarProposta = async () => {
    if (!observacoesRecusa.trim()) {
      showError('Por favor, adicione uma observação sobre a recusa.');
      return;
    }

    setCarregando(true);
    try {
      // RECUSOU: Move para banco de talentos
      const { error } = await supabase
        .from('candidatos')
        .update({ 
          banco_talentos: true,
          etapa_processo: null,
          observacoes: (candidato.observacoes || '') + `\n[${new Date().toLocaleDateString('pt-BR')}] Candidato recusou a proposta: ${observacoesRecusa}`
        })
        .eq('id', candidato.id);

      if (error) throw error;

      showSuccess('📋 Candidato movido para o Banco de Talentos.');
      onAtualizar();
      onClose();
    } catch (err) {
      showError('Erro ao registrar resposta: ' + err.message);
    } finally {
      setCarregando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        background: colors.bg.secondary,
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '480px',
        width: '100%',
        boxShadow: colors.shadow.lg,
        border: `1px solid ${colors.border.primary}`
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: `2px solid ${colors.border.primary}`
        }}>
          <h3 style={{
            color: colors.text.primary,
            margin: 0,
            fontSize: '20px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {etapa === 'escolher' ? '📋 Resposta da Proposta' : '📝 Motivo da Recusa'}
          </h3>
          <button
            onClick={() => {
              if (etapa === 'recusa_detalhes') {
                setEtapa('escolher');
                setObservacoesRecusa('');
              } else {
                onClose();
              }
            }}
            disabled={carregando}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.text.tertiary,
              fontSize: '24px',
              cursor: carregando ? 'not-allowed' : 'pointer',
              padding: '4px 8px',
              borderRadius: '6px',
              opacity: carregando ? 0.5 : 1
            }}
          >
            ✕
          </button>
        </div>

        {/* Informações do Candidato */}
        <div style={{
          background: colors.bg.primary,
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: `1px solid ${colors.border.secondary}`
        }}>
          <div style={{ color: colors.text.primary, fontWeight: '700', marginBottom: '8px', fontSize: '16px' }}>
            👤 {candidato.nome_completo}
          </div>
          <div style={{ color: colors.text.secondary, fontSize: '14px' }}>
            💼 {candidato.cargo_pretendido}
          </div>
        </div>

        {etapa === 'escolher' ? (
          <>
            <div style={{
              color: colors.text.primary,
              fontSize: '15px',
              marginBottom: '20px',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              O candidato aceitou ou recusou a proposta?
            </div>

            {/* Botões de Resposta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={aceitarProposta}
                disabled={carregando}
                style={{
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#969494ff',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: carregando ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  opacity: carregando ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {carregando ? '⏳ Processando...' : '✅ Aceitou a Proposta'}
              </button>

              <button
                onClick={() => setEtapa('recusa_detalhes')}
                disabled={carregando}
                style={{
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#969494ff',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: carregando ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  opacity: carregando ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                ❌ Recusou a Proposta
              </button>

              <button
                onClick={onClose}
                disabled={carregando}
                style={{
                  padding: '12px 20px',
                  background: colors.bg.hover,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: '10px',
                  cursor: carregando ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: carregando ? 0.5 : 1
                }}
              >
                Cancelar
              </button>
            </div>

            {/* Informações Adicionais */}
            <div style={{
              marginTop: '24px',
              padding: '12px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '8px',
              fontSize: '12px',
              color: colors.text.secondary
            }}>
              <strong style={{ color: colors.text.primary }}>💡 O que acontece:</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', lineHeight: '1.6' }}>
                <li><strong style={{ color: '#10b981' }}>Aceitou:</strong> Vai para o histórico como "Aprovado"</li>
                <li><strong style={{ color: '#f59e0b' }}>Recusou:</strong> Vai para o Banco de Talentos</li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                color: colors.text.primary,
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Por que o candidato recusou? <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                value={observacoesRecusa}
                onChange={(e) => setObservacoesRecusa(e.target.value)}
                placeholder="Ex: Salário abaixo das expectativas, aceitou outra proposta, questões pessoais..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: colors.bg.primary,
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: '8px',
                  color: colors.text.primary,
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                onBlur={(e) => e.target.style.borderColor = colors.border.primary}
              />
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
              fontSize: '13px',
              color: colors.text.secondary
            }}>
              <strong style={{ color: '#f59e0b' }}>ℹ️ Importante:</strong> Esta observação será salva no Banco de Talentos para referência futura.
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setEtapa('escolher');
                  setObservacoesRecusa('');
                }}
                disabled={carregando}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: colors.bg.hover,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: '10px',
                  cursor: carregando ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: carregando ? 0.5 : 1
                }}
              >
                ← Voltar
              </button>
              <button
                onClick={recusarProposta}
                disabled={carregando}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#949292ff',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: carregando ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  opacity: carregando ? 0.6 : 1
                }}
              >
                {carregando ? '⏳ Salvando...' : '✅ Confirmar Recusa'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}