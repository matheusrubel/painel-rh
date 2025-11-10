import { useState } from 'react';

export default function ModalBancoTalentos({ isOpen, onClose, onConfirm, candidato }) {
  const [setor, setSetor] = useState(candidato?.setor_interesse || '');
  const [observacoes, setObservacoes] = useState(candidato?.observacoes_talentos || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ setor, observacoes });
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        border: '1px solid #334155'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
          ⭐ Adicionar ao Banco de Talentos
        </h2>
        
        {candidato && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#334155', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid #475569'
          }}>
            <p style={{ color: '#f8fafc', fontWeight: 'bold', marginBottom: '5px' }}>
              {candidato.nome_completo}
            </p>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              {candidato.cargo_pretendido}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontWeight: 'bold' }}>
              Setor de Interesse *
            </label>
            <select
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #475569',
                backgroundColor: '#334155',
                color: '#f8fafc',
                fontSize: '14px'
              }}
            >
              <option value="">Selecione um setor</option>
              <option value="Contabilidade">Contabilidade</option>
              <option value="Fiscal">Fiscal</option>
              <option value="RH">RH</option>
              <option value="TI">TI</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Financeiro">Financeiro</option>
              <option value="Comercial">Comercial</option>
              <option value="Atendimento">Atendimento</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontWeight: 'bold' }}>
              Observações / Descrição
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Experiência em auditorias, conhecimento em SPED, habilidades em Excel avançado..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #475569',
                backgroundColor: '#334155',
                color: '#f8fafc',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '5px' }}>
              Adicione informações relevantes sobre o candidato
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              ⭐ Adicionar ao Banco
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#475569',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
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
