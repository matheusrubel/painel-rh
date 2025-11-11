import { useState } from 'react';
import { supabase } from '../config/supabase';

// Etapas do pipeline (mesmas do Kanban)
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
      await supabase
        .from('candidatos')
        .update({ etapa_atual: novaEtapa })
        .eq('id', candidato.id);

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

      // 5. Notificar componente pai para recarregar
      if (onStatusChange) {
        onStatusChange();
      }

      console.log(`✅ Status atualizado: ${etapaAtual} → ${novaEtapa}`);

    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }

    setSalvando(false);
  };

  const etapaInfo = ETAPAS_PIPELINE.find(e => e.id === etapaAtual);

  return (
    <select
      value={etapaAtual}
      onChange={handleChangeStatus}
      disabled={salvando}
      style={{
        padding: '6px 12px',
        backgroundColor: etapaInfo?.cor || '#64748b',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 'bold',
        cursor: salvando ? 'wait' : 'pointer',
        opacity: salvando ? 0.6 : 1,
        appearance: 'none',
        WebkitAppearance: 'none',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'white\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 8px center',
        paddingRight: '28px'
      }}
    >
      {ETAPAS_PIPELINE.map(etapa => (
        <option 
          key={etapa.id} 
          value={etapa.id}
          style={{
            backgroundColor: '#1e293b',
            color: '#f8fafc'
          }}
        >
          {etapa.icone} {etapa.nome}
        </option>
      ))}
    </select>
  );
}