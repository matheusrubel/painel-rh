export default function BadgeHistorico({ tipo, count, onClick, small = false }) {
  const configs = {
    reprovado: {
      cor: '#ef4444',
      icone: '🚫',
      texto: 'Reprovado Antes'
    },
    banco_talentos: {
      cor: '#f59e0b',
      icone: '⭐',
      texto: 'No Banco de Talentos'
    },
    desistiu: {
      cor: '#64748b',
      icone: '👋',
      texto: 'Desistiu Antes'
    }
  };

  const config = configs[tipo] || configs.reprovado;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: small ? '4px' : '6px',
        background: `${config.cor}20`,
        border: `1px solid ${config.cor}50`,
        borderRadius: small ? '6px' : '8px',
        padding: small ? '3px 8px' : '4px 10px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.background = `${config.cor}30`;
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.background = `${config.cor}20`;
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      <span style={{ fontSize: small ? '10px' : '12px' }}>{config.icone}</span>
      <span style={{
        color: config.cor,
        fontSize: small ? '10px' : '11px',
        fontWeight: '700',
        whiteSpace: 'nowrap'
      }}>
        {config.texto} ({count}x)
      </span>
    </div>
  );
}
