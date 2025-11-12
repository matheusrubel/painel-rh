import { showError } from './toast';

// Mapeamento de códigos de erro comuns
const errorMessages = {
  // Erros do PostgreSQL/Supabase
  '23505': 'Este registro já existe no sistema',
  '23503': 'Não é possível deletar este item pois está sendo usado',
  '23502': 'Campo obrigatório não foi preenchido',
  'PGRST116': 'Nenhum resultado encontrado',
  
  // Erros de autenticação
  'auth/invalid-credentials': 'Email ou senha incorretos',
  'auth/user-not-found': 'Usuário não encontrado',
  'auth/wrong-password': 'Senha incorreta',
  'auth/email-already-in-use': 'Este email já está em uso',
  'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres',
  
  // Erros de rede
  'NetworkError': 'Erro de conexão. Verifique sua internet',
  'TimeoutError': 'Tempo limite excedido. Tente novamente',
  
  // Erros de permissão
  'PermissionDenied': 'Você não tem permissão para esta ação',
  'row-level-security-violation': 'Acesso negado'
};

/**
 * Manipula erros e exibe mensagem amigável ao usuário
 * @param {Error|Object} error - Objeto de erro
 * @param {string} customMessage - Mensagem customizada (opcional)
 * @param {Object} options - Opções adicionais
 */
export const handleError = (error, customMessage = null, options = {}) => {
  console.error('Erro capturado:', error);
  
  let message = customMessage;
  
  // Se não tem mensagem customizada, tenta mapear o erro
  if (!message) {
    const errorCode = error?.code || error?.error?.code || error?.message;
    message = errorMessages[errorCode] || 'Ocorreu um erro inesperado. Tente novamente.';
    
    // Se o erro tem uma mensagem mais específica do Supabase
    if (error?.message && !errorMessages[errorCode]) {
      message = `Erro: ${error.message}`;
    }
  }
  
  showError(message, options);
  
  // Em produção, enviar para serviço de monitoramento (Sentry, etc)
  if (import.meta.env.PROD && window.Sentry) {
    window.Sentry.captureException(error);
  }
  
  return message;
};

/**
 * Trata erros de validação do Zod
 * @param {ZodError} zodError - Erro do Zod
 */
export const handleValidationError = (zodError) => {
  const firstError = zodError.errors[0];
  const message = firstError.message;
  showError(message);
  return message;
};

/**
 * Wrapper para operações assíncronas com tratamento de erro
 * @param {Function} asyncFn - Função assíncrona
 * @param {string} errorMessage - Mensagem de erro customizada
 */
export const withErrorHandler = async (asyncFn, errorMessage = null) => {
  try {
    return await asyncFn();
  } catch (error) {
    handleError(error, errorMessage);
    throw error;
  }
};

/**
 * Valida resposta do Supabase
 * @param {Object} response - Resposta do Supabase {data, error}
 * @param {string} customMessage - Mensagem customizada
 */
export const validateSupabaseResponse = (response, customMessage = null) => {
  if (response.error) {
    throw response.error;
  }
  return response.data;
};