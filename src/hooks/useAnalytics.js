// ============================================
// CUSTOM HOOK - ANALYTICS
// src/hooks/useAnalytics.js
// ============================================

import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export function useAnalytics(periodo = 'mes') {
  const [dados, setDados] = useState({
    // Métricas principais
    totalVagasAbertas: 0,
    totalCandidatosAtivos: 0,
    tempoMedioContratacao: 0,
    taxaConversao: 0,
    
    // Dados para gráficos
    vagasPorStatus: [],
    candidatosPorEtapa: [],
    vagasPorCidade: [],
    evolucaoMensal: [],
    
    // Estado
    carregando: true,
    erro: null
  });

  useEffect(() => {
    buscarDados();
  }, [periodo]);

  const buscarDados = async () => {
    try {
      setDados(prev => ({ ...prev, carregando: true, erro: null }));

      // Calcular datas do período
      const agora = new Date();
      let dataInicio = new Date();
      
      switch (periodo) {
        case 'semana':
          dataInicio.setDate(agora.getDate() - 7);
          break;
        case 'mes':
          dataInicio.setMonth(agora.getMonth() - 1);
          break;
        case 'trimestre':
          dataInicio.setMonth(agora.getMonth() - 3);
          break;
        case 'ano':
          dataInicio.setFullYear(agora.getFullYear() - 1);
          break;
        default:
          dataInicio.setMonth(agora.getMonth() - 1);
      }

      // 1. TOTAL DE VAGAS ABERTAS
      const { count: vagasAbertas } = await supabase
        .from('vagas')
        .select('*', { count: 'exact', head: true })
        .eq('ativa', true);

      // 2. TOTAL DE CANDIDATOS ATIVOS (não dispensados)
      const { count: candidatosAtivos } = await supabase
        .from('candidatos')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'dispensado')
        .or('banco_talentos.is.null,banco_talentos.eq.false');

      // 3. TEMPO MÉDIO DE CONTRATAÇÃO
      const { data: contratados } = await supabase
        .from('candidatos')
        .select('criado_em, atualizado_em')
        .eq('status', 'contratado')
        .gte('criado_em', dataInicio.toISOString());

      let tempoMedio = 0;
      if (contratados && contratados.length > 0) {
        const tempos = contratados.map(c => {
          const inicio = new Date(c.criado_em);
          const fim = new Date(c.atualizado_em || new Date());
          return Math.floor((fim - inicio) / (1000 * 60 * 60 * 24));
        });
        tempoMedio = Math.round(tempos.reduce((a, b) => a + b, 0) / tempos.length);
      }

      // 4. TAXA DE CONVERSÃO
      const { count: totalCandidatos } = await supabase
        .from('candidatos')
        .select('*', { count: 'exact', head: true })
        .gte('criado_em', dataInicio.toISOString());

      const { count: contratadosCount } = await supabase
        .from('candidatos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'contratado')
        .gte('criado_em', dataInicio.toISOString());

      const taxaConversao = totalCandidatos > 0 
        ? Math.round((contratadosCount / totalCandidatos) * 100) 
        : 0;

      // 5. VAGAS POR STATUS (para gráfico pizza)
      const { data: todasVagas } = await supabase
        .from('vagas')
        .select('ativa');

      const vagasPorStatus = [
        { name: 'Ativas', value: todasVagas?.filter(v => v.ativa).length || 0, cor: '#10b981' },
        { name: 'Inativas', value: todasVagas?.filter(v => !v.ativa).length || 0, cor: '#6c757d' }
      ];

      // 6. CANDIDATOS POR ETAPA (para gráfico funil)
      const { data: candidatosComEtapa } = await supabase
        .from('candidatos')
        .select('etapa_atual')
        .or('banco_talentos.is.null,banco_talentos.eq.false');

      const contagemEtapas = {};
      candidatosComEtapa?.forEach(c => {
        const etapa = c.etapa_atual || 'triagem';
        contagemEtapas[etapa] = (contagemEtapas[etapa] || 0) + 1;
      });

      const candidatosPorEtapa = [
        { name: 'Triagem', value: contagemEtapas['triagem'] || 0 },
        { name: 'Pré-entrevista', value: contagemEtapas['pre_entrevista'] || 0 },
        { name: 'Entrevista RH', value: contagemEtapas['entrevista_rh'] || 0 },
        { name: 'Teste', value: (contagemEtapas['teste_tecnico'] || 0) + (contagemEtapas['teste_comportamental'] || 0) },
        { name: 'Entrevista Final', value: contagemEtapas['entrevista_final'] || 0 },
        { name: 'Aprovado', value: contagemEtapas['aprovado'] || 0 }
      ];

      // 7. VAGAS POR CIDADE (para gráfico barras)
      const { data: vagasComLocal } = await supabase
        .from('vagas')
        .select('local')
        .eq('ativa', true);

      const contagemCidades = {};
      vagasComLocal?.forEach(v => {
        const cidade = v.local || 'Não informado';
        contagemCidades[cidade] = (contagemCidades[cidade] || 0) + 1;
      });

      const vagasPorCidade = Object.entries(contagemCidades)
        .map(([cidade, qtd]) => ({ name: cidade, value: qtd }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5 cidades

      // 8. EVOLUÇÃO MENSAL (para gráfico linha)
      const meses = [];
      const mesAtual = new Date();
      for (let i = 5; i >= 0; i--) {
        const data = new Date(mesAtual.getFullYear(), mesAtual.getMonth() - i, 1);
        const proximoMes = new Date(data.getFullYear(), data.getMonth() + 1, 1);
        
        const { count: candidatosMes } = await supabase
          .from('candidatos')
          .select('*', { count: 'exact', head: true })
          .gte('criado_em', data.toISOString())
          .lt('criado_em', proximoMes.toISOString());

        const { count: contratacoesMes } = await supabase
          .from('candidatos')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'contratado')
          .gte('criado_em', data.toISOString())
          .lt('criado_em', proximoMes.toISOString());

        meses.push({
          mes: data.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
          candidatos: candidatosMes || 0,
          contratacoes: contratacoesMes || 0
        });
      }

      // Atualizar estado com todos os dados
      setDados({
        totalVagasAbertas: vagasAbertas || 0,
        totalCandidatosAtivos: candidatosAtivos || 0,
        tempoMedioContratacao: tempoMedio,
        taxaConversao,
        vagasPorStatus,
        candidatosPorEtapa,
        vagasPorCidade,
        evolucaoMensal: meses,
        carregando: false,
        erro: null
      });

    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
      setDados(prev => ({
        ...prev,
        carregando: false,
        erro: 'Erro ao carregar dados analíticos'
      }));
    }
  };

  return { ...dados, refetch: buscarDados };
}