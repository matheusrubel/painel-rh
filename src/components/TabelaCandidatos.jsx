import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

export default function TabelaCandidatos({ filtros, setPaginaAtual }) {
  const [candidatos, setCandidatos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetchCandidatos();
    
    // Subscrever a mudanças em tempo real
    const channel = supabase
      .channel('candidatos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'candidatos'
        },
        () => {
          fetchCandidatos();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'etapas_candidato'
        },
        () => {
          fetchCandidatos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filtros]);

  const fetchCandidatos = async () => {
    setCarregando(true);
    try {
      let query = supabase
        .from('candidatos')
        .select('*')
        .order('criado_em', { ascending: false });

      // FILTRO PRINCIPAL: Apenas candidatos em TRIAGEM
      // Candidatos sem etapa_atual OU com etapa_atual = 'triagem'
      query = query.or('etapa_atual.is.null,etapa_atual.eq.triagem');

      // Filtro de cargo
      if (filtros.cargo) {
        query = query.ilike('cargo_pretendido', `%${filtros.cargo}%`);
      }

      // Excluir banco de talentos
      query = query.or('banco_talentos.is.null,banco_talentos.eq.false');

      const { data, error } = await query;

      if (error) throw error;
      setCandidatos(data || []);
    } catch (err) {
      console.error('Erro ao buscar candidatos:', err);
    }
    setCarregando(false);
  };

  const handleMoveToBancoTalentos = async (candidatoId) => {
    if (!confirm('Mover este candidato para o Banco de Talentos?')) return;

    try {
      const { error } = await supabase
        .from('candidatos')
        .update({ banco_talentos: true })
        .eq('id', candidatoId);

      if (error) throw error;
      
      alert('Candidato movido para o Banco de Talentos!');
      fetchCandidatos();
    } catch (err) {
      console.error('Erro ao mover para banco de talentos:', err);
      alert('Erro ao mover candidato');
    }
  };

  const handleDeleteCandidato = async (candidatoId) => {
    if (!confirm('Tem certeza que deseja excluir este candidato?')) return;

    try {
      const { error } = await supabase
        .from('candidatos')
        .delete()
        .eq('id', candidatoId);

      if (error) throw error;
      
      alert('Candidato excluído!');
      fetchCandidatos();
    } catch (err) {
      console.error('Erro ao excluir candidato:', err);
      alert('Erro ao excluir candidato');
    }
  };

  const handleIniciarProcesso = async (candidatoId) => {
    try {
      // Criar etapa inicial de triagem
      const { error: etapaError } = await supabase
        .from('etapas_candidato')
        .insert({
          candidato_id: candidatoId,
          etapa: 'triagem',
          status: 'em_andamento'
        });

      if (etapaError) throw etapaError;

      // Atualizar etapa_atual
      await supabase
        .from('candidatos')
        .update({ etapa_atual: 'triagem' })
        .eq('id', candidatoId);

      // Redirecionar para o Pipeline
      setPaginaAtual('pipeline');
    } catch (err) {
      console.error('Erro ao iniciar processo:', err);
      alert('Erro ao iniciar processo');
    }
  };

  if (carregando) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#94a3b8'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #334155',
          borderTopColor: '#f59e0b',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 15px'
        }}></div>
        Carregando candidatos...
      </div>
    );
  }

  if (candidatos.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#64748b'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎉</div>
        <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#f8fafc', marginBottom: '8px' }}>
          Nenhum candidato novo!
        </p>
        <p style={{ fontSize: '14px' }}>
          Todos os candidatos estão em processo no Pipeline
        </p>
        <button
          onClick={() => setPaginaAtual('pipeline')}
          style={{
            marginTop: '15px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          🎯 Ver Pipeline
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Info Box */}
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '15px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ fontSize: '24px' }}>📋</div>
        <div>
          <div style={{ color: '#fbbf24', fontWeight: 'bold', fontSize: '14px', marginBottom: '3px' }}>
            Candidatos Novos (Triagem)
          </div>
          <div style={{ color: '#94a3b8', fontSize: '13px' }}>
            Estes candidatos ainda não entraram no processo. Inicie o processo para movê-los ao Pipeline.
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          backgroundColor: '#1e293b',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a' }}>
              <th style={thStyle}>Nome</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Cargo</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Data</th>
              <th style={thStyle}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {candidatos.map((candidato, index) => (
              <tr
                key={candidato.id}
                style={{
                  backgroundColor: index % 2 === 0 ? '#1e293b' : '#334155',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#475569';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#1e293b' : '#334155';
                }}
              >
                <td style={tdStyle}>
                  <div style={{ fontWeight: 'bold', color: '#f8fafc' }}>
                    {candidato.nome_completo}
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                    {candidato.Email}
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{ color: '#cbd5e1', fontSize: '14px' }}>
                    {candidato.cargo_pretendido}
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    📋 Novo
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                    {new Date(candidato.criado_em).toLocaleDateString('pt-BR')}
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {/* Ver Currículo */}
                    {candidato.curriculo_url && (
                      <button
                        onClick={() => window.open(candidato.curriculo_url, '_blank')}
                        style={{
                          ...btnStyle,
                          backgroundColor: '#10b981'
                        }}
                        title="Ver Currículo"
                      >
                        📄
                      </button>
                    )}

                    {/* Iniciar Processo */}
                    <button
                      onClick={() => handleIniciarProcesso(candidato.id)}
                      style={{
                        ...btnStyle,
                        backgroundColor: '#f59e0b',
                        padding: '6px 12px',
                        fontWeight: 'bold'
                      }}
                      title="Iniciar Processo (Mover para Pipeline)"
                    >
                      ▶️ Iniciar
                    </button>

                    {/* Mover para Banco de Talentos */}
                    <button
                      onClick={() => handleMoveToBancoTalentos(candidato.id)}
                      style={{
                        ...btnStyle,
                        backgroundColor: '#8b5cf6'
                      }}
                      title="Mover para Banco de Talentos"
                    >
                      ⭐
                    </button>

                    {/* Excluir */}
                    <button
                      onClick={() => handleDeleteCandidato(candidato.id)}
                      style={{
                        ...btnStyle,
                        backgroundColor: '#ef4444'
                      }}
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Estilos
const thStyle = {
  padding: '15px',
  textAlign: 'left',
  color: '#fbbf24',
  fontWeight: 'bold',
  fontSize: '14px',
  borderBottom: '2px solid #334155'
};

const tdStyle = {
  padding: '12px 15px',
  borderBottom: '1px solid #334155'
};

const btnStyle = {
  padding: '6px 10px',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '14px',
  transition: 'all 0.2s',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  fontWeight: 'normal'
};