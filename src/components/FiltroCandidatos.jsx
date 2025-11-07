export default function FiltroCandidatos({ filtros, setFiltros }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      alignItems: 'end'
    }}>
      {/* Buscar por Cargo */}
      <div>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          color: '#cbd5e1',
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          Buscar Cargo
        </label>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            pointerEvents: 'none'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Digite o cargo..."
            value={filtros.cargo}
            onChange={(e) => setFiltros({ ...filtros, cargo: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              background: '#334155',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.875rem',
              transition: 'all 0.3s',
              outline: 'none'
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
      </div>

      {/* Filtrar por Status */}
      <div>
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          color: '#cbd5e1',
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          Status
        </label>
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            pointerEvents: 'none'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </span>
          <select
            value={filtros.status}
            onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem 2.5rem 0.75rem 2.5rem',
              background: '#334155',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontSize: '0.875rem',
              transition: 'all 0.3s',
              outline: 'none',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L6 6L11 1\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              cursor: 'pointer'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#f59e0b';
              e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#334155';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="todos">Todos os Status</option>
            <option value="novo">🟦 Novo</option>
            <option value="em_analise">🟪 Em Análise</option>
            <option value="entrevista_agendada">🟨 Entrevista Agendada</option>
            <option value="contratado">🟩 Contratado</option>
            <option value="dispensado">🟥 Dispensado</option>
          </select>
        </div>
      </div>

      {/* Botão Limpar Filtros */}
      <button
        onClick={() => setFiltros({ cargo: '', status: 'todos', bancoTalentos: null })}
        style={{
          height: '42px',
          padding: '0 1.25rem',
          background: '#334155',
          color: '#f8fafc',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.875rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          transition: 'all 0.3s'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#f59e0b';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#334155';
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 4 1 10 7 10"></polyline>
          <polyline points="23 20 23 14 17 14"></polyline>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
        </svg>
        Limpar
      </button>
    </div>
  );
}