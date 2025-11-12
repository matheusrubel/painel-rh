import { useState } from 'react';
import { supabase } from '../config/supabase';
import { candidatoSchema } from '../schemas/candidatoSchema';
import { showSuccess, showError } from '../utils/toast';
import { handleError } from '../utils/errorHandler';
import { useHistoricoCandidato } from '../hooks/useHistoricoCandidato';
import AlertaDuplicataHistorico from './AlertaDuplicataHistorico';

export default function ModalAdicionarCandidato({ isOpen, onClose, onCandidatoAdicionado }) {
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

  // Hook de histórico
  const { verificarDuplicata } = useHistoricoCandidato();
  const [alertaHistorico, setAlertaHistorico] = useState(null);
  const [dadosTemporarios, setDadosTemporarios] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

    // VERIFICAR HISTÓRICO ANTES DE SALVAR
    const resultado = await verificarDuplicata(
      formData.nome_completo,
      formData.telefone,
      formData.cpf
    );

    if (resultado.isDuplicata) {
      // Salvar dados temporariamente e mostrar alerta
      setDadosTemporarios(formData);
      setAlertaHistorico(resultado.historico);
      return; // Não salva ainda, aguarda confirmação
    }

    // Se não tem duplicata, salva direto
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
      
      // Reset form
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
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid #475569',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid #475569'
        }}>
          <h2 style={{
            color: '#f8fafc',
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
              color: '#94a3b8',
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
              e.target.style.color = '#94a3b8';
            }}
          >
            ✕
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Nome Completo */}
          <div>
            <label style={{
              color: '#cbd5e1',
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
                background: '#0f172a',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#475569'}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{
              color: '#cbd5e1',
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
                background: '#0f172a',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '14px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#475569'}
            />
          </div>

          {/* Telefone e CPF */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{
                color: '#cbd5e1',
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
                  background: '#0f172a',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#475569'}
              />
            </div>

            <div>
              <label style={{
                color: '#cbd5e1',
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#0f172a',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '14px',
                  outline: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#475569'}
              />
            </div>
          </div>

          {/* Cargo Pretendido */}
          <div>
            <label style={{
              color: '#cbd5e1',
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
                background: '#0f172a',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '14px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#475569'}
            />
          </div>

          {/* Currículo */}
          <div>
            <label style={{
              color: '#cbd5e1',
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
              background: '#0f172a',
              border: '2px dashed #475569',
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
              e.target.style.borderColor = '#475569';
              e.target.style.background = '#0f172a';
            }}>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
              />
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                {nomeArquivo || '📎 Clique para selecionar arquivo'}
              </span>
            </label>
          </div>

          {/* Mensagem/Observações */}
          <div>
            <label style={{
              color: '#cbd5e1',
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
                background: '#0f172a',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#475569'}
            />
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={carregando}
              style={{
                flex: 1,
                padding: '12px',
                background: 'rgba(71, 85, 105, 0.3)',
                color: '#f1f5f9',
                border: '1px solid rgba(71, 85, 105, 0.5)',
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
              disabled={carregando}
              style={{
                flex: 1,
                padding: '12px',
                background: carregando
                  ? 'rgba(59, 130, 246, 0.3)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: carregando ? 'not-allowed' : 'pointer',
                fontWeight: '700',
                fontSize: '14px',
                boxShadow: carregando ? 'none' : '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              {carregando ? '⏳ Salvando...' : '✅ Adicionar Candidato'}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de Alerta de Histórico */}
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
