import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { showSuccess, showError } from '../utils/toast';
import { handleError } from '../utils/errorHandler';

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
        { event: '*', schema: 'public', table: 'candidatos' },
        () => fetchCandidatos()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'etapas_candidato' },
        () => fetchCandidatos()
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
      query = query.or('etapa_atual.is.null,etapa_atual.eq.triagem');

      // Filtro de cargo
      if (filtros?.cargo) {
        query = query.ilike('cargo_pretendido', `%${filtros.cargo}%`);
      }

      // Excluir banco de talentos
      query = query.or('banco_talentos.is.null,banco_talentos.eq.false');

      const { data, error } = await query;

      if (error) throw error;

      setCandidatos(data || []);
    } catch (err) {
      handleError(err, 'Erro ao buscar candidatos');
    } finally {
      setCarregando(false);
    }
  };

  const handleMoveToBancoTalentos = async (candidatoId) => {
    if (!window.confirm('Mover este candidato para o Banco de Talentos?')) return;

    try {
      const { error } = await supabase
        .from('candidatos')
        .update({ banco_talentos: true })
        .eq('id', candidatoId);

      if (error) throw error;

      showSuccess('✅ Candidato movido para o Banco de Talentos!');
      fetchCandidatos();
    } catch (err) {
      handleError(err, 'Erro ao mover candidato');
    }
  };

  const handleDeleteCandidato = async (candidatoId) => {
    if (!window.confirm('⚠️ Tem certeza que deseja excluir este candidato permanentemente?')) return;

    try {
      const { error } = await supabase
        .from('candidatos')
        .delete()
        .eq('id', candidatoId);

      if (error) throw error;

      showSuccess('🗑️ Candidato excluído com sucesso!');
      fetchCandidatos();
    } catch (err) {
      handleError(err, 'Erro ao excluir candidato');
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
      const { error: updateError } = await supabase
        .from('candidatos')
        .update({ etapa_atual: 'triagem' })
        .eq('id', candidatoId);

      if (updateError) throw updateError;

      showSuccess('🚀 Processo iniciado! Candidato movido para Pipeline');
      
      // Redirecionar para o Pipeline
      if (setPaginaAtual) {
        setPaginaAtual('pipeline');
      }
    } catch (err) {
      handleError(err, 'Erro ao iniciar processo');
    }
  };

  if (carregando) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #334155',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 15px'
        }} />
        <p>Carregando candidatos...</p>
      </div>
    );
  }

  if (candidatos.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '12px',
        border: '1px solid #334155'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>📭</div>
        <h3 style={{ color: '#f8fafc', marginBottom: '10px' }}>Nenhum candidato novo!</h3>
        <p style={{ color: '#94a3b8' }}>
          {filtros?.cargo 
            ? `Nenhum candidato encontrado para "${filtros.cargo}"`
            : 'Todos os candidatos estão em processo no Pipeline'
          }
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        background: '#1e293b',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <thead style={{ background: '#334155' }}>
          <tr>
            <th style={{ 
              padding: '14px 12px', 
              textAlign: 'left', 
              color: '#cbd5e1', 
              fontWeight: 'bold',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Nome
            </th>
            <th style={{ 
              padding: '14px 12px', 
              textAlign: 'left', 
              color: '#cbd5e1', 
              fontWeight: 'bold',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Email
            </th>
            <th style={{ 
              padding: '14px 12px', 
              textAlign: 'left', 
              color: '#cbd5e1', 
              fontWeight: 'bold',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Cargo
            </th>
            <th style={{ 
              padding: '14px 12px', 
              textAlign: 'center', 
              color: '#cbd5e1', 
              fontWeight: 'bold',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Status
            </th>
            <th style={{ 
              padding: '14px 12px', 
              textAlign: 'center', 
              color: '#cbd5e1', 
              fontWeight: 'bold',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Data
            </th>
            <th style={{ 
              padding: '14px 12px', 
              textAlign: 'center', 
              color: '#cbd5e1', 
              fontWeight: 'bold',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {candidatos.map((candidato) => (
            <tr 
              key={candidato.id} 
              style={{ 
                borderBottom: '1px solid #334155',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#334155'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ 
                padding: '14px 12px', 
                color: '#f8fafc',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {candidato.nome_completo}
              </td>
              <td style={{ 
                padding: '14px 12px', 
                color: '#94a3b8',
                fontSize: '14px'
              }}>
                {candidato.Email}
              </td>
              <td style={{ 
                padding: '14px 12px', 
                color: '#f8fafc',
                fontSize: '14px'
              }}>
                {candidato.cargo_pretendido}
              </td>
              <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                <span style={{
                  background: '#3b82f6',
                  color: '#fff',
                  padding: '5px 14px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  📋 Novo
                </span>
              </td>
              <td style={{ 
                padding: '14px 12px', 
                textAlign: 'center', 
                color: '#94a3b8',
                fontSize: '13px'
              }}>
                {new Date(candidato.criado_em).toLocaleDateString('pt-BR')}
              </td>
              <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {/* Ver Currículo */}
                  {candidato.curriculo_url && (
                    <button
                      onClick={() => window.open(candidato.curriculo_url, '_blank')}
                      style={{
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        padding: '7px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                      onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                      title="Ver Currículo"
                    >
                      📄 CV
                    </button>
                  )}
                  
                  {/* Iniciar Processo */}
                  <button
                    onClick={() => handleIniciarProcesso(candidato.id)}
                    style={{
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#059669'}
                    onMouseLeave={(e) => e.target.style.background = '#10b981'}
                    title="Iniciar Processo Seletivo"
                  >
                    🚀 Iniciar
                  </button>

                  {/* Mover para Banco de Talentos */}
                  <button
                    onClick={() => handleMoveToBancoTalentos(candidato.id)}
                    style={{
                      background: '#f59e0b',
                      color: '#fff',
                      border: 'none',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#d97706'}
                    onMouseLeave={(e) => e.target.style.background = '#f59e0b'}
                    title="Mover para Banco de Talentos"
                  >
                    ⭐ Banco
                  </button>

                  {/* Excluir */}
                  <button
                    onClick={() => handleDeleteCandidato(candidato.id)}
                    style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      padding: '7px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                    onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                    title="Excluir Candidato"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Rodapé com total */}
      <div style={{
        padding: '12px',
        background: '#334155',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
        color: '#cbd5e1',
        fontSize: '13px',
        textAlign: 'center'
      }}>
        <strong>{candidatos.length}</strong> candidato{candidatos.length !== 1 ? 's' : ''} encontrado{candidatos.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
