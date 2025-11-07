export default function FiltroCandidatos({ filtros, setFiltros }) {
  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
      <input
        type="text"
        placeholder="Buscar por cargo"
        value={filtros.cargo}
        onChange={(e) => setFiltros({ ...filtros, cargo: e.target.value })}
        style={{ padding: '8px', minWidth: '200px' }}
      />
      
      <select
        value={filtros.status}
        onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
        style={{ padding: '8px', minWidth: '200px' }}
      >
        <option value="todos">Todos os Status</option>
        <option value="novo">Novo</option>
        <option value="em_analise">Em Análise</option>
        <option value="entrevista_agendada">Entrevista Agendada</option>
        <option value="contratado">Contratado</option>
        <option value="dispensado">Dispensado</option>
      </select>

      <button 
        onClick={() => setFiltros({ cargo: '', status: 'todos', bancoTalentos: null })}
        style={{
          padding: '8px 15px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Limpar Filtros
      </button>
    </div>
  );
}
