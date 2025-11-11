// ============================================
// FUNÇÕES AUXILIARES - NOTIFICAÇÕES
// src/utils/notificacoes.js
// ============================================

import { supabase } from '../config/supabase';

/**
 * Criar uma nova notificação
 */
export const criarNotificacao = async ({
  usuarioId,
  tipo,
  titulo,
  mensagem,
  link = null,
  entidadeTipo = null,
  entidadeId = null
}) => {
  try {
    const { data, error } = await supabase
      .from('notificacoes')
      .insert({
        usuario_id: usuarioId,
        tipo,
        titulo,
        mensagem,
        link,
        entidade_tipo: entidadeTipo,
        entidade_id: entidadeId
      })
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return { success: false, error };
  }
};

/**
 * Buscar notificações de um usuário
 */
export const buscarNotificacoes = async (usuarioId, somenteNaoLidas = false) => {
  try {
    let query = supabase
      .from('notificacoes')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('criado_em', { ascending: false });

    if (somenteNaoLidas) {
      query = query.eq('lida', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return { success: false, error, data: [] };
  }
};

/**
 * Marcar notificação como lida
 */
export const marcarComoLida = async (notificacaoId) => {
  try {
    const { error } = await supabase
      .from('notificacoes')
      .update({ 
        lida: true,
        data_leitura: new Date().toISOString()
      })
      .eq('id', notificacaoId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao marcar como lida:', error);
    return { success: false, error };
  }
};

/**
 * Marcar todas as notificações como lidas
 */
export const marcarTodasComoLidas = async (usuarioId) => {
  try {
    const { error } = await supabase
      .from('notificacoes')
      .update({ 
        lida: true,
        data_leitura: new Date().toISOString()
      })
      .eq('usuario_id', usuarioId)
      .eq('lida', false);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error);
    return { success: false, error };
  }
};

/**
 * Deletar notificação
 */
export const deletarNotificacao = async (notificacaoId) => {
  try {
    const { error } = await supabase
      .from('notificacoes')
      .delete()
      .eq('id', notificacaoId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    return { success: false, error };
  }
};

/**
 * Contar notificações não lidas
 */
export const contarNaoLidas = async (usuarioId) => {
  try {
    const { count, error } = await supabase
      .from('notificacoes')
      .select('*', { count: 'exact', head: true })
      .eq('usuario_id', usuarioId)
      .eq('lida', false);

    if (error) throw error;
    return { success: true, count: count || 0 };
  } catch (error) {
    console.error('Erro ao contar não lidas:', error);
    return { success: false, count: 0 };
  }
};

/**
 * Calcular tempo relativo (ex: "há 5 minutos")
 */
export const tempoRelativo = (data) => {
  const agora = new Date();
  const dataNotificacao = new Date(data);
  const diffMs = agora - dataNotificacao;
  const diffSeg = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSeg / 60);
  const diffHora = Math.floor(diffMin / 60);
  const diffDia = Math.floor(diffHora / 24);

  if (diffSeg < 60) return 'Agora';
  if (diffMin < 60) return `Há ${diffMin} min`;
  if (diffHora < 24) return `Há ${diffHora}h`;
  if (diffDia === 1) return 'Ontem';
  if (diffDia < 7) return `Há ${diffDia} dias`;
  if (diffDia < 30) return `Há ${Math.floor(diffDia / 7)} semanas`;
  return dataNotificacao.toLocaleDateString('pt-BR');
};

/**
 * Obter ícone por tipo de notificação
 */
export const getIconePorTipo = (tipo) => {
  const icones = {
    'novo_candidato': '👤',
    'mudanca_etapa': '📊',
    'entrevista_agendada': '📅',
    'candidato_aprovado': '✅',
    'candidato_reprovado': '❌',
    'vaga_criada': '📋',
    'comentario_adicionado': '💬',
    'prazo_vencendo': '⏰',
    'documento_pendente': '📄'
  };
  return icones[tipo] || '🔔';
};

/**
 * Obter cor por tipo de notificação
 */
export const getCorPorTipo = (tipo) => {
  const cores = {
    'novo_candidato': '#3b82f6',
    'mudanca_etapa': '#f59e0b',
    'entrevista_agendada': '#8b5cf6',
    'candidato_aprovado': '#10b981',
    'candidato_reprovado': '#ef4444',
    'vaga_criada': '#06b6d4',
    'comentario_adicionado': '#94a3b8',
    'prazo_vencendo': '#f59e0b',
    'documento_pendente': '#f59e0b'
  };
  return cores[tipo] || '#64748b';
};

// ============================================
// EXEMPLOS DE USO
// ============================================

/**
 * Exemplo: Notificar RH sobre novo candidato
 */
export const notificarNovoCandidato = async (candidato, usuariosRH) => {
  for (const usuarioId of usuariosRH) {
    await criarNotificacao({
      usuarioId,
      tipo: 'novo_candidato',
      titulo: '🎯 Novo Candidato!',
      mensagem: `${candidato.nome_completo} se candidatou para ${candidato.cargo_pretendido}`,
      link: `/candidatos/${candidato.id}`,
      entidadeTipo: 'candidato',
      entidadeId: candidato.id
    });
  }
};

/**
 * Exemplo: Notificar sobre mudança de etapa
 */
export const notificarMudancaEtapa = async (candidato, novaEtapa, responsavelId) => {
  const nomesEtapas = {
    'triagem': 'Triagem',
    'pre_entrevista': 'Pré-entrevista',
    'entrevista_rh': 'Entrevista RH',
    'teste_tecnico': 'Teste Técnico',
    'teste_comportamental': 'Teste Comportamental',
    'entrevista_final': 'Entrevista Final',
    'aprovado': 'Aprovado',
    'reprovado': 'Reprovado'
  };

  if (responsavelId) {
    await criarNotificacao({
      usuarioId: responsavelId,
      tipo: 'mudanca_etapa',
      titulo: '📊 Candidato Movido!',
      mensagem: `${candidato.nome_completo} está agora em: ${nomesEtapas[novaEtapa] || novaEtapa}`,
      link: '/pipeline',
      entidadeTipo: 'candidato',
      entidadeId: candidato.id
    });
  }
};

/**
 * Exemplo: Notificar aprovação de candidato
 */
export const notificarAprovacao = async (candidato, usuariosNotificar) => {
  for (const usuarioId of usuariosNotificar) {
    await criarNotificacao({
      usuarioId,
      tipo: 'candidato_aprovado',
      titulo: '✅ Candidato Aprovado!',
      mensagem: `${candidato.nome_completo} foi aprovado para ${candidato.cargo_pretendido}`,
      link: `/candidatos/${candidato.id}`,
      entidadeTipo: 'candidato',
      entidadeId: candidato.id
    });
  }
};