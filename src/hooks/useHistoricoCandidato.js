import { useState } from 'react';
import { supabase } from '../config/supabase';

export function useHistoricoCandidato() {
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const buscarHistorico = async (nome, telefone, cpf) => {
    setCarregando(true);
    try {
      let query = supabase
        .from('historico_candidatos')
        .select('*')
        .order('data_inscricao', { ascending: false });

      const conditions = [];
      
      if (nome) {
        conditions.push(`nome_completo.ilike.%${nome}%`);
      }
      if (telefone) {
        const telefoneNumeros = telefone.replace(/\D/g, '');
        if (telefoneNumeros.length >= 9) {
          conditions.push(`telefone.ilike.%${telefoneNumeros}%`);
        }
      }
      if (cpf) {
        const cpfNumeros = cpf.replace(/\D/g, '');
        conditions.push(`cpf.eq.${cpfNumeros}`);
      }

      if (conditions.length > 0) {
        query = query.or(conditions.join(','));
      }

      const { data, error } = await query;

      if (error) throw error;

      setHistorico(data || []);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    } finally {
      setCarregando(false);
    }
  };

  const verificarDuplicata = async (nome, telefone, cpf) => {
    const hist = await buscarHistorico(nome, telefone, cpf);
    
    if (hist.length > 0) {
      const temReprovado = hist.some(h => h.status_final === 'reprovado');
      const temBancoTalentos = hist.some(h => h.status_final === 'banco_talentos');
      const temDesistiu = hist.some(h => h.status_final === 'desistiu');
      
      return {
        isDuplicata: true,
        historico: hist,
        flags: {
          reprovado: temReprovado,
          bancoTalentos: temBancoTalentos,
          desistiu: temDesistiu
        }
      };
    }

    return { isDuplicata: false, historico: [], flags: {} };
  };

  return {
    historico,
    carregando,
    buscarHistorico,
    verificarDuplicata
  };
}
