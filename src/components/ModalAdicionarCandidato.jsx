import { useState } from 'react';
import { supabase } from '../config/supabase';

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
      setArquivo(file);
      setNomeArquivo(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      let curriculo_url = '';

      if (arquivo) {
        const nomeUnico = `${Date.now()}_${arquivo.name}`;
        const { error: uploadError } = await supabase.storage
          .from('curriculos')
          .upload(nomeUnico, arquivo);

        if (uploadError) {
          alert('Erro ao enviar currículo: ' + uploadError.message);
          setCarregando(false);
          return;
        }
        curriculo_url = nomeUnico;
      }

      const { error } = await supabase.from('candidatos').insert([{
        ...formData,
        curriculo_url
      }]);

      if (error) {
        alert('Erro ao adicionar candidato: ' + error.message);
      } else {
        alert('Candidato adicionado com sucesso!');
        setFormData({
          nome_completo: '',
          Email: '',
          telefone: '',
          cargo_pretendido: '',
          mensagem: ''
        });
        setArquivo(null);
        setNomeArquivo('');
        onCandidatoAdicionado();
        onClose();
      }
    } catch (err) {
      alert('Erro: ' + err.message);
    }
    setCarregando(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        padding: '2rem',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)',
        border: '1px solid #334155',
        animation: 'slideIn 0.3s ease-out'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            color: '#f8fafc',
            fontSize: '1.5rem',
            fontWeight: 700
          }}>
            Adicionar Candidato
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '6px',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#334155';
              e.target.style.color = '#f8fafc';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#94a3b8';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {/* Nome Completo */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#cbd5e1',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              Nome Completo <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="nome_completo"
              value={formData.nome_completo}
              onChange={handleChange}
              required
              placeholder="Digite o nome completo"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#334155',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#f59e0b';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#334155';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#cbd5e1',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              E-mail <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              required
              placeholder="email@exemplo.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#334155',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#f59e0b';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#334155';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Telefone */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#cbd5e1',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              Telefone
            </label>
            <input
              type="text"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#334155',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#f59e0b';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#334155';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Cargo Pretendido */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#cbd5e1',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              Cargo Pretendido <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="cargo_pretendido"
              value={formData.cargo_pretendido}
              onChange={handleChange}
              required
              placeholder="Ex: Contador, Analista..."
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#334155',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#f59e0b';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#334155';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Currículo */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#cbd5e1',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              Currículo
            </label>
            <div style={{
              padding: '1.5rem',
              border: '2px dashed #334155',
              borderRadius: '8px',
              backgroundColor: '#0f172a',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#f59e0b';
              e.currentTarget.style.background = '#1e293b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.background = '#0f172a';
            }}
            >
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="fileInput"
              />
              <label htmlFor="fileInput" style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={nomeArquivo ? '#10b981' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <span style={{
                  color: nomeArquivo ? '#10b981' : '#cbd5e1',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}>
                  {nomeArquivo ? `✅ ${nomeArquivo}` : 'Clique para selecionar arquivo'}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                  PDF, DOC, DOCX
                </span>
              </label>
            </div>
          </div>

          {/* Mensagem/Comentário */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#cbd5e1',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              Comentário (opcional)
            </label>
            <textarea
              name="mensagem"
              value={formData.mensagem}
              onChange={handleChange}
              placeholder="Observações sobre o candidato..."
              rows="3"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#334155',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'all 0.3s',
                fontFamily: 'Inter, sans-serif',
                resize: 'vertical'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#f59e0b';
                e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#334155';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Botões */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            marginTop: '0.5rem'
          }}>
            <button
              type="submit"
              disabled={carregando}
              style={{
                flex: 1,
                padding: '0.75rem 1.25rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: carregando ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!carregando) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
              }}
            >
              {carregando ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  Salvando...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                  Salvar
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem 1.25rem',
                background: '#334155',
                color: '#f8fafc',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#1e293b';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#334155';
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}