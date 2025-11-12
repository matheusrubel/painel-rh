import { useState } from 'react';
import { supabase } from '../config/supabase';
import { showSuccess, showError } from '../utils/toast';
import { handleError } from '../utils/errorHandler';

const ETAPAS_PIPELINE = [
  { id: 'triagem', nome: 'Triagem', cor: '#3b82f6', icone: '📋' },
  { id: 'pre_entrevista', nome: 'Pré-entrevista', cor: '#8b5cf6', icone: '📝' },
  { id: 'entrevista_rh', nome: 'Entrevista RH', cor: '#f59e0b', icone: '💼' },
  { id: 'teste_tecnico', nome: 'Teste Técnico', cor: '#06b6d4', icone: '🧪' },
  { id: 'teste_comportamental', nome: 'Teste Comportamental', cor: '#10b981', icone: '🎯' },
  { id: 'entrevista_final', nome: 'Entrevista Final', cor: '#f59e0b', icone: '⭐' },
  { id: 'aprovado', nome: 'Aprovado', cor: '#10b981', icone: '✅' },
  { id: 'reprovado', nome: 'Reprovado', cor: '#ef4444', icone: '❌' }
];

export default function StatusDropdown({ candidato, onStatusChange }) {
  const [salvando, setSalvando] = useState(false);
  const etapaAtual = candidato.etapa_atual || 'triagem';

  const handleChangeStatus = async (e) => {
    const novaEtapa = e.target.value;
    
    if (novaEtapa === etapaAtual) return;

    setSalvando(true);

    try {
      // 1. Criar nova etapa no histórico
      const { error: etapaError } = await supabase
        .from('etapas_candidato')
        .insert({
          candidato_id: candidato.id,
          etapa: novaEtapa,
          status: 'em_andamento'
        });

      if (etapaError) throw etapaError;

      // 2. Atualizar campo cache no candidato
      const { error: updateError } = await supabase
        .from('candidatos')
        .update({ etapa_atual: novaEtapa })
        .eq('id', candidato.id);

      if (updateError) throw updateError;

      // 3. Se mudou para "aprovado", atualizar status geral
      if (novaEtapa === 'aprovado') {
        await supabase
          .from('candidatos')
          .update({ status: 'contratado' })
          .eq('id', candidato.id);
      }

      // 4. Se mudou para "reprovado", atualizar status geral
      if (novaEtapa === 'reprovado') {
        await supabase
          .from('candidatos')
          .update({ status: 'dispensado' })
          .eq('id', candidato.id);
      }

      // ✅ Toast de sucesso
      const etapaInfo = ETAPAS_PIPELINE.find(e => e.id === novaEtapa);
      showSuccess(`${etapaInfo.icone} Status atualizado para: ${etapaInfo.nome}`);

      // 5. Notificar componente pai para recarregar
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error) {
      handleError(error, 'Erro ao atualizar status');
    } finally {
      setSalvando(false);
    }
  };

  const etapaInfo = ETAPAS_PIPELINE.find(e => e.id === etapaAtual);

  return (
    <div style={{ position: 'relative' }}>
      <select
        value={etapaAtual}
        onChange={handleChangeStatus}
        disabled={salvando}
        style={{
          background: etapaInfo?.cor || '#334155',
          color: '#fff',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '6px',
          cursor: salvando ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          opacity: salvando ? 0.6 : 1,
          transition: 'all 0.3s ease',
          minWidth: '180px'
        }}
      >
        {ETAPAS_PIPELINE.map(etapa => (
          <option 
            key={etapa.id} 
            value={etapa.id}
            style={{ 
              background: '#1e293b',
              padding: '10px'
            }}
          >
            {etapa.icone} {etapa.nome}
          </option>
        ))}
      </select>
      
      {salvando && (
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '10px',
          transform: 'translateY(-50%)',
          width: '16px',
          height: '16px',
          border: '2px solid rgba(255,255,255,0.3)',
          borderTop: '2px solid #fff',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite'
        }} />
      )}
    </div>
  );
}
