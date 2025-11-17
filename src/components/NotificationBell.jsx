import { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import { useTheme } from '../contexts/ThemeContext';
import {
  buscarNotificacoes,
  marcarComoLida,
  marcarTodasComoLidas,
  tempoRelativo,
  getIconePorTipo,
  getCorPorTipo
} from '../utils/notificacoes';

export default function NotificationBell() {
  const { colors, isDark } = useTheme();
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    inicializar();
  }, []);

  useEffect(() => {
    const handleClickFora = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownAberto(false);
      }
    };

    if (dropdownAberto) {
      document.addEventListener('mousedown', handleClickFora);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickFora);
    };
  }, [dropdownAberto]);

  const inicializar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUsuarioId(user.id);
    await carregarNotificacoes(user.id);
    
    const channel = supabase
      .channel('notificacoes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes',
          filter: `usuario_id=eq.${user.id}`
        },
        (payload) => {
          setNotificacoes(prev => [payload.new, ...prev]);
          setNaoLidas(prev => prev + 1);
          animarSino();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const carregarNotificacoes = async (userId) => {
    setCarregando(true);
    const { data } = await buscarNotificacoes(userId, false);
    
    if (data) {
      setNotificacoes(data.slice(0, 20));
      setNaoLidas(data.filter(n => !n.lida).length);
    }
    
    setCarregando(false);
  };

  const handleNotificacaoClick = async (notificacao) => {
    if (!notificacao.lida) {
      await marcarComoLida(notificacao.id);
      setNaoLidas(prev => Math.max(0, prev - 1));
      setNotificacoes(prev =>
        prev.map(n => n.id === notificacao.id ? { ...n, lida: true } : n)
      );
    }

    if (notificacao.link) {
      window.location.hash = notificacao.link;
      setDropdownAberto(false);
    }
  };

  const handleMarcarTodasLidas = async () => {
    if (!usuarioId) return;
    
    await marcarTodasComoLidas(usuarioId);
    setNaoLidas(0);
    setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
  };

  const animarSino = () => {
    const sino = document.getElementById('notification-bell');
    if (sino) {
      sino.classList.add('shake');
      setTimeout(() => sino.classList.remove('shake'), 500);
    }
  };

  const toggleDropdown = () => {
    setDropdownAberto(!dropdownAberto);
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Botão do Sino */}
      <button
        id="notification-bell"
        onClick={toggleDropdown}
        style={{
          position: 'relative',
          padding: '10px',
          background: dropdownAberto ? colors.bg.tertiary : 'transparent',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          if (!dropdownAberto) e.target.style.background = colors.bg.tertiary;
        }}
        onMouseLeave={(e) => {
          if (!dropdownAberto) e.target.style.background = 'transparent';
        }}
      >
        {/* Ícone do Sino - Cor dinâmica baseada no tema */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.text.primary}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>

        {/* Badge de Notificações Não Lidas */}
        {naoLidas > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: naoLidas > 9 ? '22px' : '18px',
            height: naoLidas > 9 ? '22px' : '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: naoLidas > 9 ? '10px' : '11px',
            fontWeight: 'bold',
            border: `2px solid ${colors.bg.secondary}`,
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            {naoLidas > 99 ? '99+' : naoLidas}
          </span>
        )}
      </button>

      {/* Dropdown de Notificações */}
      {dropdownAberto && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '380px',
          maxHeight: '500px',
          backgroundColor: colors.bg.secondary,
          border: `1px solid ${colors.border.primary}`,
          borderRadius: '12px',
          boxShadow: colors.shadow.lg,
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Header do Dropdown */}
          <div style={{
            padding: '15px 20px',
            borderBottom: `1px solid ${colors.border.primary}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: colors.bg.primary
          }}>
            <h3 style={{
              color: colors.text.primary,
              fontSize: '16px',
              fontWeight: 'bold',
              margin: 0
            }}>
              🔔 Notificações
            </h3>
            {naoLidas > 0 && (
              <button
                onClick={handleMarcarTodasLidas}
                style={{
                  padding: '5px 10px',
                  backgroundColor: 'transparent',
                  color: '#f59e0b',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = colors.bg.tertiary}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista de Notificações */}
          <div style={{
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {carregando ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: colors.text.tertiary
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  border: `3px solid ${colors.bg.tertiary}`,
                  borderTopColor: '#f59e0b',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 10px'
                }}></div>
                Carregando...
              </div>
            ) : notificacoes.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: colors.text.muted
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>📕</div>
                <p style={{ fontSize: '14px' }}>Nenhuma notificação</p>
              </div>
            ) : (
              notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  onClick={() => handleNotificacaoClick(notificacao)}
                  style={{
                    padding: '15px 20px',
                    borderBottom: `1px solid ${colors.border.primary}`,
                    cursor: notificacao.link ? 'pointer' : 'default',
                    backgroundColor: notificacao.lida ? 'transparent' : 'rgba(245, 158, 11, 0.05)',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'start'
                  }}
                  onMouseEnter={(e) => {
                    if (notificacao.link) {
                      e.currentTarget.style.backgroundColor = colors.bg.tertiary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = notificacao.lida 
                      ? 'transparent' 
                      : 'rgba(245, 158, 11, 0.05)';
                  }}
                >
                  {/* Ícone */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: getCorPorTipo(notificacao.tipo),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0
                  }}>
                    {getIconePorTipo(notificacao.tipo)}
                  </div>

                  {/* Conteúdo */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: colors.text.primary,
                      fontSize: '14px',
                      fontWeight: notificacao.lida ? 'normal' : 'bold',
                      marginBottom: '4px'
                    }}>
                      {notificacao.titulo}
                    </div>
                    <div style={{
                      color: colors.text.tertiary,
                      fontSize: '13px',
                      lineHeight: '1.4',
                      marginBottom: '6px'
                    }}>
                      {notificacao.mensagem}
                    </div>
                    <div style={{
                      color: colors.text.muted,
                      fontSize: '11px'
                    }}>
                      {tempoRelativo(notificacao.criado_em)}
                    </div>
                  </div>

                  {/* Indicador de não lida */}
                  {!notificacao.lida && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#f59e0b',
                      flexShrink: 0,
                      marginTop: '6px'
                    }}></div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notificacoes.length > 0 && (
            <div style={{
              padding: '12px 20px',
              borderTop: `1px solid ${colors.border.primary}`,
              textAlign: 'center',
              backgroundColor: colors.bg.primary
            }}>
              <button
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: 'transparent',
                  color: '#f59e0b',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = colors.bg.tertiary}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>
      )}

      {/* Animações */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(0.95);
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
          20%, 40%, 60%, 80% { transform: rotate(10deg); }
        }

        #notification-bell.shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}