import { useState } from 'react';
import { supabase } from '../config/supabase';
import { candidatoSchema } from '../schemas/candidatoSchema';
import { showSuccess, showError } from '../utils/toast';
import { handleError } from '../utils/errorHandler';

export default function ModalAdicionarCandidato({ isOpen, onClose, onCandidatoAdicionado }) {
  const [formData, setFormData] = useState({
    nome_completo: '',
    Email: '',
    telefone: '',
    cargo_pretendido: '',
    mensagem: ''
  });
  const [arquivo, setArquivo] = useState(null);
  const [nomeArquivo, setNomeArquivo] = useState('');
  const [carregando, setCarregando] = useState(false);

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
      
      const tiposPermitidos = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
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
    setCarregando(true);

    try {
      const dadosValidados = candidatoSchema.parse(formData);

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
      overflowY: 'auto'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        padding: '30px',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid #475569',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        margin: '20px 0'
      }}>
        <h2 style={{ color: '#f8fafc', marginBottom: '20px', fontSize: '24px', fontWeight: '700' }}>
          ➕ Adicionar Novo Candidato
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
              Nome Completo *
            </label>
            <input
              type="text"
              name="nome_completo"
              value={formData.nome_completo}
              onChange={handleChange}
              required
              placeholder="Ex: João Silva Santos"
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(15, 23, 42, 0.6)',
                color: '#f8fafc',
                border: '1px solid rgba(71, 85, 105, 0.4)',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(71, 85, 105, 0.4)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
              Email *
            </label>
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              required
              placeholder="exemplo@email.com"
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(15, 23, 42, 0.6)',
                color: '#f8fafc',
                border: '1px solid rgba(71, 85, 105, 0.4)',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(71, 85, 105, 0.4)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
              Telefone
            </label>
            <input
              type="tel"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(XX) XXXXX-XXXX"
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(15, 23, 42, 0.6)',
                color: '#f8fafc',
                border: '1px solid rgba(71, 85, 105, 0.4)',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(71, 85, 105, 0.4)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <small style={{ color: '#94a3b8', fontSize: '12px' }}>
              Formato: (XX) XXXXX-XXXX
            </small>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
              Cargo Pretendido *
            </label>
            <input
              type="text"
              name="cargo_pretendido"
              value={formData.cargo_pretendido}
              onChange={handleChange}
              required
              placeholder="Ex: Desenvolvedor Full Stack"
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(15, 23, 42, 0.6)',
                color: '#f8fafc',
                border: '1px solid rgba(71, 85, 105, 0.4)',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(71, 85, 105, 0.4)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
              Currículo (PDF ou Word - Máx 5MB)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(15, 23, 42, 0.6)',
                color: '#f8fafc',
                border: '1px solid rgba(71, 85, 105, 0.4)',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            />
            {nomeArquivo && (
              <div style={{ marginTop: '8px', color: '#10b981', fontSize: '12px' }}>
                ✅ {nomeArquivo}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#cbd5e1', display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
              Mensagem / Observações
            </label>
            <textarea
              name="mensagem"
              value={formData.mensagem}
              onChange={handleChange}
              rows={4}
              placeholder="Informações adicionais sobre o candidato..."
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(15, 23, 42, 0.6)',
                color: '#f8fafc',
                border: '1px solid rgba(71, 85, 105, 0.4)',
                borderRadius: '10px',
                resize: 'vertical',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(71, 85, 105, 0.4)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={carregando}
              style={{
                padding: '12px 28px',
                background: 'rgba(71, 85, 105, 0.3)',
                color: '#f1f5f9',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                borderRadius: '10px',
                cursor: carregando ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                opacity: carregando ? 0.5 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={carregando}
              style={{
                padding: '12px 28px',
                background: carregando 
                  ? 'rgba(148, 163, 184, 0.3)' 
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: carregando ? 'not-allowed' : 'pointer',
                fontWeight: '700',
                fontSize: '14px',
                opacity: carregando ? 0.6 : 1,
                transition: 'all 0.2s ease',
                boxShadow: carregando ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              {carregando ? '⏳ Salvando...' : '✅ Adicionar Candidato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
