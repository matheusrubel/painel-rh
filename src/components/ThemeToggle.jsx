import { useTheme } from '../contexts/ThemeContext';

/**
 * Componente de alternância de tema
 * Botão moderno e elegante para trocar entre tema dark e light
 */
export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: 'relative',
        width: '60px',
        height: '32px',
        backgroundColor: isDark ? '#334155' : '#e2e8f0',
        border: `2px solid ${isDark ? '#475569' : '#cbd5e1'}`,
        borderRadius: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '2px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: isDark 
          ? '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 2px rgba(0, 0, 0, 0.2)' 
          : '0 2px 8px rgba(0, 0, 0, 0.08), inset 0 1px 2px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 4px 12px rgba(0, 0, 0, 0.4)'
          : '0 4px 12px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 2px 8px rgba(0, 0, 0, 0.3)'
          : '0 2px 8px rgba(0, 0, 0, 0.08)';
      }}
      title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
    >
      {/* Círculo deslizante com ícone */}
      <div
        style={{
          position: 'absolute',
          width: '26px',
          height: '26px',
          background: isDark 
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fb 100%)',
          borderRadius: '50%',
          transform: isDark ? 'translateX(2px)' : 'translateX(30px)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '15px',
          boxShadow: isDark
            ? '0 2px 8px rgba(0, 0, 0, 0.4)'
            : '0 2px 8px rgba(0, 0, 0, 0.15)',
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </div>

      {/* Ícones de fundo (decorativos) */}
      <div style={{
        position: 'absolute',
        left: '8px',
        fontSize: '12px',
        opacity: isDark ? 0.4 : 0,
        transition: 'opacity 0.3s ease',
      }}>
        🌙
      </div>
      <div style={{
        position: 'absolute',
        right: '8px',
        fontSize: '12px',
        opacity: isDark ? 0 : 0.4,
        transition: 'opacity 0.3s ease',
      }}>
        ☀️
      </div>
    </button>
  );
}