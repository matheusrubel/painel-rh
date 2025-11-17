import { useState } from 'react';
import { supabase } from '../config/supabase';
import { useTheme } from '../contexts/ThemeContext';

export default function Login({ onLogin }) {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });

    if (error) {
      setErro('Credenciais inválidas');
      setCarregando(false);
    } else {
      onLogin();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #aabbff 0%, #fbbf24 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: 420,
        width: '100%',
        background: isDark 
          ? 'rgba(30, 41, 59, 0.92)'
          : 'rgba(255, 255, 255, 0.95)',
        border: `1.5px solid ${isDark ? 'rgba(251, 191, 36, 0.20)' : 'rgba(251, 191, 36, 0.40)'}`,
        borderRadius: '18px',
        padding: '2.5rem 2rem',
        backdropFilter: 'blur(12px)',
        boxShadow: isDark 
          ? '0 4px 44px -12px rgb(30 41 59 / 65%)'
          : '0 4px 44px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img
            src="/logo.png"
            alt="Logo Michelc"
            style={{
              width: 80,
              height: 80,
              objectFit: 'contain',
              borderRadius: 16,
              background: isDark 
                ? 'rgba(255, 255, 255, 0.35)' 
                : 'rgba(30, 41, 59, 0.9)',
              boxShadow: '0 4px 18px #fbbf2450',
              marginBottom: '1.6rem',
              padding: '8px'
            }}
          />
        </div>

        {/* Título */}
        <h1 style={{
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '2rem',
          marginBottom: 8,
          color: '#e4b02fff'
        }}>
          Gestão Inteligente
        </h1>

        <p style={{ 
          textAlign: 'center', 
          color: isDark ? '#94a3b8' : '#6b7280', 
          fontSize: '0.875rem', 
          marginBottom: '2rem' 
        }}>
          Michelc Assessoria Contábil
        </p>

        {/* Formulário */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Campo Email */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: isDark ? '#cbd5e1' : '#374151',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              E-mail
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: isDark ? '#94a3b8' : '#6b7280'
              }}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={carregando}
                placeholder="seu@email.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 1.25rem 0.75rem 3rem',
                  background: isDark ? '#334155' : '#f9fafb',
                  border: `1px solid ${isDark ? '#334155' : '#d1d5db'}`,
                  borderRadius: '8px',
                  color: isDark ? '#f8fafc' : '#111827',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#f59e0b';
                  e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDark ? '#334155' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: isDark ? '#cbd5e1' : '#374151',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              Senha
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: isDark ? '#94a3b8' : '#6b7280'
              }}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </span>
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={carregando}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 2.5rem 0.75rem 3rem',
                  background: isDark ? '#334155' : '#f9fafb',
                  border: `1px solid ${isDark ? '#334155' : '#d1d5db'}`,
                  borderRadius: '8px',
                  color: isDark ? '#f8fafc' : '#111827',
                  fontSize: '0.875rem',
                  transition: 'all 0.3s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#f59e0b';
                  e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = isDark ? '#334155' : '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />

              {/* Botão mostrar/ocultar senha */}
              <button
                type="button"
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setMostrarSenha(!mostrarSenha)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: isDark ? '#94a3b8' : '#6b7280',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  height: '24px',
                  width: '24px',
                  justifyContent: 'center'
                }}
                tabIndex={-1}
              >
                {mostrarSenha ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.94 17.94A10.06 10.06 0 0 1 12 19c-5.523 0-10-4.477-10-10a9.96 9.96 0 0 1 2.065-6.23M1 1l22 22"></path>
                    <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24"></path>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mensagem de Erro */}
          {erro && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {erro}
            </div>
          )}

          {/* Botão de Login */}
          <button
            type="submit"
            disabled={carregando}
            style={{
              width: '100%',
              height: '48px',
              fontSize: '1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: isDark ? 'white' : '#1f2937',
              border: 'none',
              borderRadius: '8px',
              cursor: carregando ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (!carregando) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
            }}
          >
            {carregando ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: `2px solid ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(31,41,55,0.3)'}`,
                  borderTopColor: isDark ? 'white' : '#1f2937',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Rodapé */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
          textAlign: 'center'
        }}>
          <p style={{
            color: isDark ? '#94a3b8' : '#6b7280',
            fontSize: '0.75rem'
          }}>
            Acesso restrito aos colaboradores do RH
          </p>
        </div>
      </div>

      {/* Copyright */}
      <div style={{
        position: 'absolute',
        bottom: '1rem',
        left: 0,
        right: 0,
        textAlign: 'center',
        zIndex: 10
      }}>
        <p style={{
          color: isDark ? '#94a3b8' : '#6b7280',
          fontSize: '0.75rem'
        }}>
          © 2025 Michelc Assessoria Contábil
        </p>
      </div>
    </div>
  );
}