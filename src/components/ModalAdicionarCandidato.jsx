import { useState } from 'react';
import { supabase } from '../config/supabase';
import { useTheme } from '../contexts/ThemeContext';
import { candidatoSchema } from '../schemas/candidatoSchema';
import { showSuccess, showError } from '../utils/toast';
import { handleError } from '../utils/errorHandler';
import { useHistoricoCandidato } from '../hooks/useHistoricoCandidato';
import AlertaDuplicataHistorico from './AlertaDuplicataHistorico';

export default function ModalAdicionarCandidato({ isOpen, onClose, onCandidatoAdicionado }) {
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    nome_completo: '',
    Email: '',
    telefone: '',
    cpf: '',
    cargo_pretendido: '',
    mensagem: ''
  });
  
  const [arquivo, setArquivo] = useState(null);
  const [nomeArquivo, setNomeArquivo] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [cpfInvalido, setCpfInvalido] = useState(false);

  const { verificarDuplicata } = useHistoricoCandidato();
  const [alertaHistorico, setAlertaHistorico] = useState(null);
  const [dadosTemporarios, setDadosTemporarios] = useState(null);

  // ✅ FUNÇÃO DE FORMATAÇÃO DE CPF
  const formatarCPF = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 11) {
      return numeros
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return valor;
  };

  // ✅ FUNÇÃO DE VALIDAÇÃO DE CPF
  const validarCPF = (cpf) => {
    const numeros = cpf.replace(/\D/g, '');
    
    if (numeros.length !== 11) return false;
    if (/^(\d)\1+$/.test(numeros)) return false; // Todos números iguais
    
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
      soma += parseInt(numeros.substring(i - 1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.substring(9, 10))) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) {
      soma += parseInt(numeros.substring(i - 1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(numeros.substring(10, 11))) return false;
    
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // ✅ Formatar CPF enquanto digita
    if (name === 'cpf') {
      const cpfFormatado = formatarCPF(value);
      setFormData(prev => ({ ...prev, [name]: cpfFormatado }));
      
      // Validar CPF quando completar 14 caracteres (000.000.000-00)
      if (cpfFormatado.length === 14) {
        setCpfInvalido(!validarCPF(cpfFormatado));
      } else {
        setCpfInvalido(false);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showError('Arquivo muito grande! Máximo 5MB');
        return;
      }

      const tiposPermitidos = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!tiposPermitidos.includes(file.type)) {
        showError('Apenas arquivos PDF ou Word são permitidos');
        return;
      }

      setArquivo(file);
      setNomeArquivo(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome_completo || !formData.Email) {
      showError('Preencha nome e email');
      return;
    }

    // ✅ VALIDAÇÃO DE CPF OBRIGATÓRIO
    if (!formData.cpf) {
      showError('⚠️ CPF é obrigatório!');
      return;
    }

    if (cpfInvalido || !validarCPF(formData.cpf)) {
      showError('⚠️ CPF inválido! Verifique o número digitado.');
      return;
    }

    const resultado = await verificarDuplicata(
      formData.nome_completo,
      formData.telefone,
      formData.cpf
    );

    if (resultado.isDuplicata) {
      setDadosTemporarios(formData);
      setAlertaHistorico(resultado.historico);
      return;
    }

    await salvarCandidato(formData);
  };

  const salvarCandidato = async (dados) => {
    setCarregando(true);

    try {
      const dadosValidados = candidatoSchema.parse(dados);

      let curriculo_url = '';

      if (arquivo) {
        const nomeUnico = `${Date.now()}_${arquivo.name}`;
        const { error: uploadError } = await supabase.storage
          .from('curriculos')
          .upload(nomeUnico, arquivo);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage 
          .from('curriculos')
          .getPublicUrl(nomeUnico);

        curriculo_url = urlData.publicUrl;
      }

      const { error } = await supabase.from('candidatos').insert([{
        ...dadosValidados,
        curriculo_url,
        etapa_atual: null,
        status: 'novo'
      }]);

      if (error) throw error;

      showSuccess('✅ Candidato adicionado com sucesso!');
      
      setFormData({
        nome_completo: '',
        Email: '',
        telefone: '',
        cpf: '',
        cargo_pretendido: '',
        mensagem: ''
      });
      setArquivo(null);
      setNomeArquivo('');
      setCpfInvalido(false);

      if (onCandidatoAdicionado) {
        onCandidatoAdicionado();
      }

      onClose();
    } catch (err) {
      if (err.name === 'ZodError') {
        const primeiroErro = err.errors[0];
        showError(primeiroErro.message);
      } else {
        handleError(err, 'Erro ao adicionar candidato');
      }
    } finally {
      setCarregando(false);
    }
  };

  const handleContinuarMesmoAssim = () => {
    setAlertaHistorico(null);
    salvarCandidato(dadosTemporarios);
  };

  if (!isOpen) return null;

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
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: colors.bg.secondary,
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: `1px solid ${colors.border.primary}`,
        boxShadow: colors.shadow.lg
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: `1px solid ${colors.border.primary}`
        }}>
          <h2 style={{
            color: colors.text.primary,
            margin: 0,
            fontSize: '22px',
            fontWeight: '700'
          }}>
            ➕ Adicionar Candidato
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.text.tertiary,
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(248, 113, 113, 0.1)';
              e.target.style.color = '#f87171';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = colors.text.tertiary;
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{
              color: colors.text.secondary,
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Nome Completo *
            </label>
            <input
              type="text"
              name="nome_completo"
              value={formData.nome_completo}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                background: colors.bg.primary,
                border: `1px solid ${colors.border.primary}`,
                borderRadius: '8px',
                color: colors.text.primary,
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = colors.border.primary}
            />
          </div>

          <div>
            <label style={{
              color: colors.text.secondary,
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Email *
            </label>
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                background: colors.bg.primary,
                border: `1px solid ${colors.border.primary}`,
                borderRadius: '8px',
                color: colors.text.primary,
                fontSize: '14px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = colors.border.primary}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{
                color: colors.text.secondary,
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Telefone
              </label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: colors.bg.primary,
                  border: `1px solid ${colors.border.primary}`,
                  borderRadius: '8px',
                  color: colors.text.primary,
                  fontSize: '14px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = colors.border.primary}
              />
            </div>

            <div>
              <label style={{
                color: colors.text.secondary,
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                CPF * {cpfInvalido && <span style={{ color: '#ef4444', fontSize: '12px' }}>(inválido)</span>}
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                maxLength="14"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: colors.bg.primary,
                  border: `2px solid ${cpfInvalido ? '#ef4444' : colors.border.primary}`,
                  borderRadius: '8px',
                  color: colors.text.primary,
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => {
                  if (!cpfInvalido) {
                    e.target.style.borderColor = '#3b82f6';
                  }
                }}
                onBlur={(e) => {
                  if (!cpfInvalido) {
                    e.target.style.borderColor = colors.border.primary;
                  }
                }}
              />
              {cpfInvalido && (
                <div style={{
                  marginTop: '6px',
                  color: '#ef4444',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ⚠️ CPF inválido
                </div>
              )}
            </div>
          </div>

          <div>
            <label style={{
              color: colors.text.secondary,
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Cargo Pretendido
            </label>
            <input
              type="text"
              name="cargo_pretendido"
              value={formData.cargo_pretendido}
              onChange={handleChange}
              placeholder="Ex: Desenvolvedor Full Stack"
              style={{
                width: '100%',
                padding: '12px',
                background: colors.bg.primary,
                border: `1px solid ${colors.border.primary}`,
                borderRadius: '8px',
                color: colors.text.primary,
                fontSize: '14px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = colors.border.primary}
            />
          </div>

          <div>
            <label style={{
              color: colors.text.secondary,
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Currículo (PDF ou Word - Máx 5MB)
            </label>
            <label style={{
              display: 'block',
              padding: '12px',
              background: colors.bg.primary,
              border: `2px dashed ${colors.border.primary}`,
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.background = 'rgba(59, 130, 246, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = colors.border.primary;
              e.target.style.background = colors.bg.primary;
            }}>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
              />
              <span style={{ color: colors.text.tertiary, fontSize: '14px' }}>
                {nomeArquivo || '📎 Clique para selecionar arquivo'}
              </span>
            </label>
          </div>

          <div>
            <label style={{
              color: colors.text.secondary,
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Observações
            </label>
            <textarea
              name="mensagem"
              value={formData.mensagem}
              onChange={handleChange}
              rows={4}
              placeholder="Observações adicionais sobre o candidato..."
              style={{
                width: '100%',
                padding: '12px',
                background: colors.bg.primary,
                border: `1px solid ${colors.border.primary}`,
                borderRadius: '8px',
                color: colors.text.primary,
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = colors.border.primary}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={carregando}
              style={{
                flex: 1,
                padding: '12px',
                background: colors.bg.hover,
                color: colors.text.primary,
                border: `1px solid ${colors.border.primary}`,
                borderRadius: '10px',
                cursor: carregando ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                opacity: carregando ? 0.5 : 1
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={carregando || cpfInvalido}
              style={{
                flex: 1,
                padding: '12px',
                background: (carregando || cpfInvalido)
                  ? colors.bg.tertiary
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                cursor: (carregando || cpfInvalido) ? 'not-allowed' : 'pointer',
                fontWeight: '700',
                fontSize: '14px',
                boxShadow: (carregando || cpfInvalido) ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)',
                opacity: (carregando || cpfInvalido) ? 0.6 : 1
              }}
            >
              {carregando ? '⏳ Salvando...' : '✅ Adicionar Candidato'}
            </button>
          </div>
        </form>
      </div>

      {alertaHistorico && (
        <AlertaDuplicataHistorico
          historico={alertaHistorico}
          onClose={() => setAlertaHistorico(null)}
          onContinuar={handleContinuarMesmoAssim}
        />
      )}
    </div>
  );
}