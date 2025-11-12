import { useState } from 'react';
import { supabase } from '../config/supabase';
import { showSuccess, showError } from '../utils/toast';

export default function ModalReprovarCandidato({ candidato, onClose, onConfirm }) {
  const [motivo, setMotivo] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleReprovar = async () => {
    if (!motivo.trim()) {
      showError('Por favor, informe o motivo da reprovação');
      return;
    }

    setSalvando(true);

    try {
      // 1. Adicionar ao histórico
      const { error: historicoError } = await supabase
        .from('historico_candidatos')
        .insert([{
          candidato_id: candidato.id,
          nome_completo: candidato.nome_completo,
          telefone: candidato.telefone || null,
          cpf: candidato.cpf || null,
          email: candidato.Email,
          cargo_pretendido: candidato.cargo_pretendido,
          vaga_id: candidato.vaga_id || null,
          status_final: 'reprovado',
          etapa_final: candidato.etapa_atual || 'Triagem',
          score: null,
          observacoes: motivo,
          data_inscricao: candidato.created_at
        }]);

      if (historicoError) throw historicoError;

      // 2. Deletar candidato ativo
      const { error: deleteError } = await supabase
        .from('candidatos')
        .delete()
        .eq('id', candidato.id);

      if (deleteError) throw deleteError;

      showSuccess('❌ Candidato reprovado e movido para o histórico');
      onConfirm();
    } catch (err) {
      console.error('Erro ao reprovar candidato:', err);
      showError('Erro ao reprovar candidato');
    } finally {
      setSalvando(false);
    }
  };

  if (!candidato) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '500px',
        width: '100%',
        border: '2px solid #ef4444',
        boxShadow: '0 25px 60px rgba(239, 68, 68, 0.3)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '36px'
          }}>
            ❌
          </div>
          <h2 style={{
            color: '#f8fafc',
            margin: '0 0 8px 0',
            fontSize: '22px',
            fontWeight: '700'
          }}>
            Reprovar Candidato
          </h2>
          <p style={{
            color: '#94a3b8',
            fontSize: '14px',
            margin: 0
          }}>
            {candidato.nome_completo}
          </p>
        </div>

        {/* Alerta */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '20px',
          fontSize: '13px',
          color: '#fca5a5'
        }}>
          <strong>⚠️ Atenção:</strong> O candidato será movido para o histórico e removido do processo ativo
        </div>

        {/* Motivo */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            color: '#cbd5e1',
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            Motivo da Reprovação *
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={4}
            placeholder="Descreva o motivo da reprovação..."
            style={{
              width: '100%',
              padding: '12px',
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #475569',
              borderRadius: '8px',
              fontSize: '13px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            disabled={salvando}
            style={{
              flex: 1,
              padding: '12px',
              background: 'rgba(71, 85, 105, 0.3)',
              color: '#f1f5f9',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: '10px',
              cursor: salvando ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '14px'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleReprovar}
            disabled={salvando || !motivo.trim()}
            style={{
              flex: 1,
              padding: '12px',
              background: salvando || !motivo.trim()
                ? 'rgba(239, 68, 68, 0.3)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: salvando || !motivo.trim() ? 'not-allowed' : 'pointer',
              fontWeight: '700',
              fontSize: '14px',
              boxShadow: salvando || !motivo.trim() ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            {salvando ? '⏳ Reprovando...' : '❌ Reprovar'}
          </button>
        </div>
      </div>
    </div>
  );
}
