import { useState, useEffect, useRef } from 'react';
import { supabase } from '../config/supabase';
import {
  buscarNotificacoes,
  marcarComoLida,
  marcarTodasComoLidas,
  tempoRelativo,
  getIconePorTipo,
  getCorPorTipo
} from '../utils/notificacoes';

export default function NotificationBell() {
  const [notificacoes, setNotificacoes] = useState([]);
  const [naoLidas, setNaoLidas] = useState(0);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [usuarioId, setUsuarioId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    inicializar();
  }, []);

  // Fechar dropdown ao clicar fora
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
    // Obter usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUsuarioId(user.id);
    await carregarNotificacoes(user.id);
    
    // Configurar Real-time
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
          // Nova notificação recebida
          setNotificacoes(prev => [payload.new, ...prev]);
          setNaoLidas(prev => prev + 1);
          
          // Animação do sino
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
      setNotificacoes(data.slice(0, 20)); // Limitar a 20 notificações
      setNaoLidas(data.filter(n => !n.lida).length);
    }
    
    setCarregando(false);
  };

  const handleNotificacaoClick = async (notificacao) => {
    // Marcar como lida
    if (!notificacao.lida) {
      await marcarComoLida(notificacao.id);
      setNaoLidas(prev => Math.max(0, prev - 1));
      setNotificacoes(prev =>
        prev.map(n => n.id === notificacao.id ? { ...n, lida: true } : n)
      );
    }

    // Navegar se tiver link
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
          background: dropdownAberto ? '#334155' : 'transparent',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          if (!dropdownAberto) e.target.style.background = '#334155';
        }}
        onMouseLeave={(e) => {
          if (!dropdownAberto) e.target.style.background = 'transparent';
        }}
      >
        {/* Ícone do Sino */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f8fafc"
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
            border: '2px solid #0f172a',
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
          backgroundColor: '#1e293b',
          border: '1px solid #334155',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          zIndex: 1000,
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Header do Dropdown */}
          <div style={{
            padding: '15px 20px',
            borderBottom: '1px solid #334155',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#0f172a'
          }}>
            <h3 style={{
              color: '#f8fafc',
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
                onMouseEnter={(e) => e.target.style.backgroundColor = '#334155'}
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
                color: '#94a3b8'
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  border: '3px solid #334155',
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
                color: '#64748b'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔕</div>
                <p style={{ fontSize: '14px' }}>Nenhuma notificação</p>
              </div>
            ) : (
              notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  onClick={() => handleNotificacaoClick(notificacao)}
                  style={{
                    padding: '15px 20px',
                    borderBottom: '1px solid #334155',
                    cursor: notificacao.link ? 'pointer' : 'default',
                    backgroundColor: notificacao.lida ? 'transparent' : 'rgba(245, 158, 11, 0.05)',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'start'
                  }}
                  onMouseEnter={(e) => {
                    if (notificacao.link) {
                      e.currentTarget.style.backgroundColor = '#334155';
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
                      color: '#f8fafc',
                      fontSize: '14px',
                      fontWeight: notificacao.lida ? 'normal' : 'bold',
                      marginBottom: '4px'
                    }}>
                      {notificacao.titulo}
                    </div>
                    <div style={{
                      color: '#94a3b8',
                      fontSize: '13px',
                      lineHeight: '1.4',
                      marginBottom: '6px'
                    }}>
                      {notificacao.mensagem}
                    </div>
                    <div style={{
                      color: '#64748b',
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
              borderTop: '1px solid #334155',
              textAlign: 'center',
              backgroundColor: '#0f172a'
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
                onMouseEnter={(e) => e.target.style.backgroundColor = '#334155'}
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

        /* Scrollbar customizada */
        div::-webkit-scrollbar {
          width: 6px;
        }

        div::-webkit-scrollbar-track {
          background: #1e293b;
        }

        div::-webkit-scrollbar-thumb {
          background: #475569;
          borderRadius: 3px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  );
}