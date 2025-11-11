import { useState } from 'react';
import { supabase } from '../config/supabase';

export default function ModalCriarVaga({ isOpen, onClose, onVagaCriada }) {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    atribuicoes: '',
    beneficios: '',
    requisitos: '',
    local: ''
  });
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCarregando(true);

    try {
      const vagaData = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        atribuicoes: formData.atribuicoes.split('\n').filter(a => a.trim()),
        beneficios: formData.beneficios.split('\n').filter(b => b.trim()),
        requisitos: formData.requisitos.split('\n').filter(r => r.trim()),
        local: formData.local,
        ativa: true
      };

      const { error } = await supabase.from('vagas').insert([vagaData]);

      if (error) {
        alert('Erro ao criar vaga: ' + error.message);
      } else {
        alert('Vaga criada com sucesso!');
        setFormData({
          titulo: '',
          descricao: '',
          atribuicoes: '',
          beneficios: '',
          requisitos: '',
          local: ''
        });
        onVagaCriada();
        onClose();
      }
    } catch (err) {
      alert('Erro: ' + err.message);
    }
    setCarregando(false);
  };

  if (!isOpen) return null;

  const labelStyle = { 
    color: '#cbd5e1', 
    display: 'block', 
    marginBottom: '5px', 
    fontWeight: 'bold' 
  };
  
  const inputStyle = { 
    width: '100%', 
    padding: '10px', 
    border: '1px solid #475569', 
    boxSizing: 'border-box', 
    borderRadius: '6px',
    backgroundColor: '#334155',
    color: '#f8fafc',
    fontSize: '14px'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        border: '1px solid #334155',
        maxHeight: '90vh',
        overflowY: 'auto',
        margin: '20px'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#f8fafc' }}>Criar Nova Vaga</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Título da Vaga *</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ex: Analista de Dados"
              required
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Descrição</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Descrição geral da vaga..."
              style={{ ...inputStyle, minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Atribuições (uma por linha)</label>
            <textarea
              name="atribuicoes"
              value={formData.atribuicoes}
              onChange={handleChange}
              placeholder="Análise de dados&#10;Automações&#10;Integração de sistemas"
              style={{ ...inputStyle, minHeight: '100px', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Benefícios (um por linha)</label>
            <textarea
              name="beneficios"
              value={formData.beneficios}
              onChange={handleChange}
              placeholder="Plano de carreira&#10;Unimed&#10;VR e VT"
              style={{ ...inputStyle, minHeight: '100px', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Requisitos (um por linha)</label>
            <textarea
              name="requisitos"
              value={formData.requisitos}
              onChange={handleChange}
              placeholder="Ensino superior completo&#10;Experiência com Python&#10;Conhecimento em SQL"
              style={{ ...inputStyle, minHeight: '100px', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Local</label>
            <input
              type="text"
              name="local"
              value={formData.local}
              onChange={handleChange}
              placeholder="Ex: São Paulo - Híbrido"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={carregando}
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: carregando ? 'not-allowed' : 'pointer',
                flex: 1,
                fontWeight: 'bold',
                fontSize: '14px',
                opacity: carregando ? 0.7 : 1,
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                if (!carregando) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {carregando ? 'Criando...' : 'Criar Vaga'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 20px',
                backgroundColor: '#475569',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                flex: 1,
                fontSize: '14px',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#64748b';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#475569';
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