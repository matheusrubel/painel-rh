import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { useTheme } from '../contexts/ThemeContext';


export default function Login({ onLogin }) {
  const { isDark, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrarMe, setLembrarMe] = useState(false);
  
  // Estados dos bonecos
  const [focoCampo, setFocoCampo] = useState('none');
  const [olhosX, setOlhosX] = useState(0);
  const [erroAnimacao, setErroAnimacao] = useState(false);


  const handleLogin = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });


    if (error) {
      setErro('Credenciais inválidas');
      setErroAnimacao(true);
      setTimeout(() => setErroAnimacao(false), 1000);
      setCarregando(false);
    } else {
      onLogin();
    }
  };


  useEffect(() => {
    if (focoCampo === 'email' && email.length > 0) {
      const maxOffset = 6;
      const offset = Math.min(email.length * 0.25, maxOffset);
      setOlhosX(offset);
    } else if (email.length === 0) {
      setOlhosX(0);
    }
  }, [email, focoCampo]);


  const handleEmailFocus = (e) => {
    setFocoCampo('email');
    e.target.style.borderColor = '#f59e0b';
    e.target.style.boxShadow = '0 0 0 4px rgba(245, 158, 11, 0.1)';
  };


  const handleEmailBlur = (e) => {
    setFocoCampo('none');
    e.target.style.borderColor = isDark ? '#334155' : '#e5e7eb';
    e.target.style.boxShadow = 'none';
  };


  const handleSenhaFocus = (e) => {
    setFocoCampo('senha');
    e.target.style.borderColor = '#f59e0b';
    e.target.style.boxShadow = '0 0 0 4px rgba(245, 158, 11, 0.1)';
  };


  const handleSenhaBlur = (e) => {
    setFocoCampo('none');
    e.target.style.borderColor = isDark ? '#334155' : '#e5e7eb';
    e.target.style.boxShadow = 'none';
  };


  const BonecoProfissional = ({ index, tamanho = 80 }) => {
    const olhosFechados = focoCampo === 'senha' && !mostrarSenha;
    const surpreso = focoCampo === 'senha' && mostrarSenha;
    
    return (
      <div style={{
        width: `${tamanho}px`,
        height: `${tamanho * 1.4}px`,
        position: 'relative',
        transition: 'transform 0.4s ease',
        animation: erroAnimacao ? 'shake 0.5s ease' : 'none'
      }}>
        {/* Corpo - Branco/creme claro */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${tamanho * 0.7}px`,
          height: `${tamanho * 0.6}px`,
          background: '#fafaf8',
          borderRadius: `${tamanho * 0.35}px ${tamanho * 0.35}px 0 0`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
        }}>
          {/* Gravata */}
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '0',
            height: '0',
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: `12px solid #f59e0b`
          }} />
        </div>

        {/* Cabeça - Bege claro */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${tamanho * 0.75}px`,
          height: `${tamanho * 0.75}px`,
          background: '#fef3c7',
          borderRadius: '50%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        }}>
          {/* Chapéu/Cabelo - Cinza escuro */}
          <div style={{
            position: 'absolute',
            top: '-5%',
            left: '10%',
            right: '10%',
            height: '35%',
            background: '#475569',
            borderRadius: '50% 50% 0 0'
          }} />

          {/* Olhos */}
          {!olhosFechados ? (
            <>
              <div style={{
                position: 'absolute',
                top: '40%',
                left: '22%',
                width: '18%',
                height: surpreso ? '22%' : '18%',
                background: 'white',
                borderRadius: '50%',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                transition: 'height 0.3s ease'
              }}>
                <div style={{
                  width: '60%',
                  height: '60%',
                  background: '#1f2937',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(calc(-50% + ${olhosX}px), -50%)`,
                  transition: 'transform 0.15s ease'
                }} />
              </div>
              <div style={{
                position: 'absolute',
                top: '40%',
                right: '22%',
                width: '18%',
                height: surpreso ? '22%' : '18%',
                background: 'white',
                borderRadius: '50%',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                transition: 'height 0.3s ease'
              }}>
                <div style={{
                  width: '60%',
                  height: '60%',
                  background: '#1f2937',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: `translate(calc(-50% + ${olhosX}px), -50%)`,
                  transition: 'transform 0.15s ease'
                }} />
              </div>
            </>
          ) : (
            // Olhos fechados PRETOS
            <>
              <div style={{
                position: 'absolute',
                top: '48%',
                left: '22%',
                width: '18%',
                height: '3px',
                background: '#1f2937',
                borderRadius: '2px',
                transition: 'all 0.2s ease'
              }} />
              <div style={{
                position: 'absolute',
                top: '48%',
                right: '22%',
                width: '18%',
                height: '3px',
                background: '#1f2937',
                borderRadius: '2px',
                transition: 'all 0.2s ease'
              }} />
            </>
          )}

          {/* Boca - reage ao erro */}
          <div style={{
            position: 'absolute',
            bottom: erroAnimacao ? '20%' : '22%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: erroAnimacao ? '25%' : '35%',
            height: erroAnimacao ? '12%' : '8%',
            borderBottom: erroAnimacao ? 'none' : '3px solid #92400e',
            borderRadius: erroAnimacao ? '50%' : '0 0 50px 50px',
            background: erroAnimacao ? '#92400e' : 'transparent',
            transition: 'all 0.3s ease'
          }} />
        </div>
      </div>
    );
  };


  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: isDark 
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      position: 'relative'
    }}>
      {/* Botão de Tema */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          border: 'none',
          background: isDark 
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(15, 23, 42, 0.1)',
          backdropFilter: 'blur(10px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.background = isDark 
            ? 'rgba(255, 255, 255, 0.15)'
            : 'rgba(15, 23, 42, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = isDark 
            ? 'rgba(255, 255, 255, 0.1)'
            : 'rgba(15, 23, 42, 0.1)';
        }}
      >
        {isDark ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </button>

      {/* Lado Esquerdo - Bonecos */}
      <div style={{
        flex: '1',
        background: isDark 
          ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage: `radial-gradient(${isDark ? '#f59e0b' : '#d97706'} 1px, transparent 1px)`,
          backgroundSize: '30px 30px'
        }} />

        {/* Logo - Grande e visível em ambos os temas */}
        <div style={{ 
          marginBottom: '3rem', 
          position: 'relative', 
          zIndex: 10,
          textAlign: 'center',
        }}>
          <img
            src={isDark ? "/logo.png" : "/logoPreta.png"}
            alt="Michelc Assessoria Contábil"
            style={{
              width: 280,
              height: 280,
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto',
              filter: isDark 
                ? 'drop-shadow(0 8px 24px rgba(251, 191, 36, 0.4))'
                : 'drop-shadow(0 8px 24px rgba(0, 0, 0, 0.2))',
            }}
          />
        </div>

        {/* Bonecos */}
        <div style={{
          display: 'flex',
          gap: '2rem',
          alignItems: 'flex-end',
          position: 'relative',
          zIndex: 10
        }}>
          <BonecoProfissional index={0} tamanho={70} />
          <BonecoProfissional index={1} tamanho={90} />
          <BonecoProfissional index={2} tamanho={70} />
        </div>

        {/* Título */}
        <div style={{
          marginTop: '3rem',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          <h2 style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: isDark ? '#f8fafc' : '#1f2937',
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em'
          }}>
            Gestão Inteligente
          </h2>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem',
        background: isDark ? '#0f172a' : '#ffffff'
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: isDark ? '#f8fafc' : '#111827',
              marginBottom: '0.5rem',
              letterSpacing: '-0.02em'
            }}>
              Bem-vindo de volta
            </h1>
            <p style={{
              color: isDark ? '#94a3b8' : '#6b7280',
              fontSize: '0.9375rem'
            }}>
              Acesse sua conta para continuar
            </p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: isDark ? '#e2e8f0' : '#374151',
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
                  color: isDark ? '#64748b' : '#9ca3af',
                  pointerEvents: 'none'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={handleEmailFocus}
                  onBlur={handleEmailBlur}
                  required
                  disabled={carregando}
                  placeholder="seu@email.com"
                  style={{
                    width: '100%',
                    padding: '0.875rem 1rem 0.875rem 3rem',
                    background: isDark ? '#1e293b' : '#f9fafb',
                    border: `2px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                    borderRadius: '10px',
                    color: isDark ? '#f8fafc' : '#111827',
                    fontSize: '0.9375rem',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: isDark ? '#e2e8f0' : '#374151',
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
                  color: isDark ? '#64748b' : '#9ca3af',
                  pointerEvents: 'none'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  onFocus={handleSenhaFocus}
                  onBlur={handleSenhaBlur}
                  required
                  disabled={carregando}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '0.875rem 3rem 0.875rem 3rem',
                    background: isDark ? '#1e293b' : '#f9fafb',
                    border: `2px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                    borderRadius: '10px',
                    color: isDark ? '#f8fafc' : '#111827',
                    fontSize: '0.9375rem',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: isDark ? '#64748b' : '#9ca3af',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '6px',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f59e0b'}
                  onMouseLeave={(e) => e.currentTarget.style.color = isDark ? '#64748b' : '#9ca3af'}
                >
                  {mostrarSenha ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                color: isDark ? '#94a3b8' : '#6b7280',
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                <input
                  type="checkbox"
                  checked={lembrarMe}
                  onChange={(e) => setLembrarMe(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#f59e0b',
                    cursor: 'pointer'
                  }}
                />
                Lembrar-me
              </label>
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f59e0b',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Esqueci minha senha
              </button>
            </div>

            {erro && (
              <div style={{
                padding: '0.75rem 1rem',
                background: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                borderRadius: '10px',
                color: '#ef4444',
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              style={{
                width: '100%',
                height: '50px',
                fontSize: '1rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: isDark ? '#ffffff' : '#1f2937',
                border: isDark ? 'none' : '2px solid #d97706',
                borderRadius: '10px',
                cursor: carregando ? 'not-allowed' : 'pointer',
                boxShadow: isDark 
                  ? '0 4px 14px rgba(245, 158, 11, 0.4)'
                  : '0 4px 14px rgba(217, 119, 6, 0.5)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}
              onMouseEnter={(e) => {
                if (!carregando) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = isDark 
                    ? '0 8px 20px rgba(245, 158, 11, 0.5)'
                    : '0 8px 20px rgba(217, 119, 6, 0.6)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isDark 
                  ? '0 4px 14px rgba(245, 158, 11, 0.4)'
                  : '0 4px 14px rgba(217, 119, 6, 0.5)';
              }}
            >
              {carregando ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '3px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}/>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div style={{
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: `1px solid ${isDark ? '#1e293b' : '#e5e7eb'}`,
            textAlign: 'center'
          }}>
            <p style={{
              color: isDark ? '#64748b' : '#94a3b8',
              fontSize: '0.6876rem',
              lineHeight: '1.4'
            }}>
              © 2025 Michelc Assessoria Contábil • Acesso restrito ao RH
            </p>
            <p style={{
              color: isDark ? '#475569' : '#a1a1aa',
              fontSize: '0.685rem',
              marginTop: '0.25rem'
            }}>
              Desenvolvido pelo setor de Inteligência de Dados e Automação
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}