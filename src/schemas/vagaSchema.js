import { z } from 'zod';

// Schema para criar/editar vaga
export const vagaSchema = z.object({
  titulo: z.string()
    .min(3, 'Título deve ter pelo menos 3 caracteres')
    .max(100, 'Título muito longo')
    .transform(val => val.trim()),
  
  descricao: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(2000, 'Descrição muito longa')
    .optional()
    .or(z.literal('')),
  
  atribuicoes: z.string()
    .min(10, 'Atribuições devem ter pelo menos 10 caracteres')
    .transform(val => {
      // Converter string com quebras de linha em array
      return val.split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }),
  
  beneficios: z.string()
    .transform(val => {
      if (!val) return [];
      return val.split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }),
  
  requisitos: z.string()
    .min(10, 'Requisitos devem ter pelo menos 10 caracteres')
    .transform(val => {
      return val.split('\n')
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }),
  
  local: z.string()
    .min(3, 'Local deve ter pelo menos 3 caracteres')
    .max(100, 'Local muito longo')
    .transform(val => val.trim()),
  
  tipo_contrato: z.enum(['CLT', 'PJ', 'Estágio', 'Temporário', 'Freelancer'])
    .optional()
    .or(z.literal(''))
    .transform(val => val || 'CLT'),
  
  modalidade: z.enum(['Presencial', 'Remoto', 'Híbrido'])
    .optional()
    .or(z.literal(''))
    .transform(val => val || 'Presencial'),
  
  salario: z.string()
    .optional()
    .or(z.literal(''))
    .transform(val => val?.trim() || null),
  
  carga_horaria: z.string()
    .optional()
    .or(z.literal(''))
    .transform(val => val?.trim() || '40h/semana'),
  
  prioridade: z.enum(['baixa', 'media', 'alta', 'urgente'])
    .optional()
    .or(z.literal(''))
    .transform(val => val || 'media'),
  
  ativa: z.boolean()
    .default(true)
});

// Schema parcial para atualizações
export const vagaUpdateSchema = vagaSchema.partial();

// Schema simplificado apenas com campos obrigatórios
export const vagaQuickSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
  local: z.string().min(3, 'Local deve ter pelo menos 3 caracteres'),
  ativa: z.boolean().default(true)
});