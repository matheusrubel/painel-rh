import { z } from 'zod';

// Regex para validação de telefone brasileiro
const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

// Schema para criar/editar candidato
export const candidatoSchema = z.object({
  nome_completo: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo (máximo 100 caracteres)')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  
  Email: z.string()
    .email('Email inválido')
    .toLowerCase()
    .transform(val => val.trim()),
  
  telefone: z.string()
    .regex(phoneRegex, 'Telefone inválido. Use o formato: (XX) XXXXX-XXXX')
    .optional()
    .or(z.literal('')),
  
  cargo_pretendido: z.string()
    .min(3, 'Cargo deve ter pelo menos 3 caracteres')
    .max(100, 'Cargo muito longo')
    .transform(val => val.trim()),
  
  linkedin_url: z.string()
    .url('URL do LinkedIn inválida')
    .optional()
    .or(z.literal(''))
    .transform(val => val?.trim() || null),
  
  mensagem: z.string()
    .max(1000, 'Mensagem muito longa (máximo 1000 caracteres)')
    .optional()
    .or(z.literal(''))
    .transform(val => val?.trim() || null),
  
  curriculo_url: z.string()
    .url('URL do currículo inválida')
    .optional()
    .or(z.literal(''))
    .transform(val => val?.trim() || null),
  
  vaga_id: z.string()
    .uuid('ID de vaga inválido')
    .optional()
    .or(z.literal(''))
    .transform(val => val || null)
});

// Schema parcial para atualizações
export const candidatoUpdateSchema = candidatoSchema.partial();

// Schema para mover candidato de etapa
export const etapaUpdateSchema = z.object({
  candidato_id: z.string().uuid('ID de candidato inválido'),
  etapa: z.enum([
    'triagem',
    'pre_entrevista',
    'entrevista_rh',
    'teste_tecnico',
    'teste_comportamental',
    'entrevista_final',
    'aprovado',
    'reprovado'
  ], {
    errorMap: () => ({ message: 'Etapa inválida' })
  }),
  status: z.enum(['em_andamento', 'concluido', 'cancelado'])
    .default('em_andamento')
});

// Schema para banco de talentos
export const bancoTalentosSchema = z.object({
  setor_interesse: z.string()
    .min(3, 'Setor deve ter pelo menos 3 caracteres')
    .max(50, 'Setor muito longo'),
  
  observacoes_talentos: z.string()
    .max(500, 'Observações muito longas (máximo 500 caracteres)')
    .optional()
    .or(z.literal(''))
});