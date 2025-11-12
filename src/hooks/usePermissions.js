import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

/**
 * Hook para gerenciar permissões do usuário (RBAC)
 * @returns {Object} Objeto com permissões e funções auxiliares
 */
export function usePermissions() {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        setLoading(false);
        return;
      }

      setUser(currentUser);

      // Buscar permissões do usuário através da view
      const { data, error } = await supabase
        .from('usuario_permissoes')
        .select('*')
        .eq('usuario_id', currentUser.id);

      if (error) throw error;

      setPermissions(data || []);
      
      // Extrair roles únicos
      const uniqueRoles = [...new Set(data?.map(p => p.role_nome) || [])];
      setRoles(uniqueRoles);
      
    } catch (error) {
      console.error('Erro ao buscar permissões:', error);
      // Em caso de erro, definir como array vazio (sem permissões)
      setPermissions([]);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verifica se o usuário tem permissão para uma ação em um recurso
   * @param {string} recurso - Nome do recurso (ex: 'candidatos', 'vagas')
   * @param {string} acao - Ação desejada (ex: 'criar', 'editar', 'deletar', 'visualizar')
   * @returns {boolean} True se tiver permissão
   */
  const can = (recurso, acao) => {
    // Admin tem acesso a tudo
    if (isAdmin()) return true;
    
    return permissions.some(
      p => p.recurso === recurso && p.acao === acao
    );
  };

  /**
   * Verifica se o usuário tem um role específico
   * @param {string} roleName - Nome do role
   * @returns {boolean} True se tiver o role
   */
  const hasRole = (roleName) => {
    return roles.includes(roleName);
  };

  /**
   * Verifica se o usuário é administrador
   * @returns {boolean} True se for admin
   */
  const isAdmin = () => hasRole('admin');

  /**
   * Verifica se o usuário é gerente de RH
   * @returns {boolean} True se for gerente
   */
  const isRhManager = () => hasRole('rh_manager');

  /**
   * Verifica se o usuário é analista de RH
   * @returns {boolean} True se for analista
   */
  const isRhAnalyst = () => hasRole('rh_analyst');

  /**
   * Verifica se o usuário pode criar candidatos
   * @returns {boolean} True se puder criar
   */
  const canCreateCandidatos = () => can('candidatos', 'criar');

  /**
   * Verifica se o usuário pode editar candidatos
   * @returns {boolean} True se puder editar
   */
  const canEditCandidatos = () => can('candidatos', 'editar');

  /**
   * Verifica se o usuário pode deletar candidatos
   * @returns {boolean} True se puder deletar
   */
  const canDeleteCandidatos = () => can('candidatos', 'deletar');

  /**
   * Verifica se o usuário pode visualizar candidatos
   * @returns {boolean} True se puder visualizar
   */
  const canViewCandidatos = () => can('candidatos', 'visualizar');

  /**
   * Verifica se o usuário pode criar vagas
   * @returns {boolean} True se puder criar
   */
  const canCreateVagas = () => can('vagas', 'criar');

  /**
   * Verifica se o usuário pode editar vagas
   * @returns {boolean} True se puder editar
   */
  const canEditVagas = () => can('vagas', 'editar');

  /**
   * Verifica se o usuário pode deletar vagas
   * @returns {boolean} True se puder deletar
   */
  const canDeleteVagas = () => can('vagas', 'deletar');

  /**
   * Verifica se o usuário pode visualizar analytics
   * @returns {boolean} True se puder visualizar
   */
  const canViewAnalytics = () => can('analytics', 'visualizar');

  /**
   * Recarrega as permissões do servidor
   */
  const refetch = () => {
    fetchPermissions();
  };

  return {
    // Estado
    permissions,
    roles,
    loading,
    user,
    
    // Funções gerais
    can,
    hasRole,
    refetch,
    
    // Verificações de roles
    isAdmin,
    isRhManager,
    isRhAnalyst,
    
    // Permissões específicas para candidatos
    canCreateCandidatos,
    canEditCandidatos,
    canDeleteCandidatos,
    canViewCandidatos,
    
    // Permissões específicas para vagas
    canCreateVagas,
    canEditVagas,
    canDeleteVagas,
    
    // Permissões para analytics
    canViewAnalytics
  };
}

/**
 * Hook simplificado que retorna apenas se o usuário é admin
 * @returns {Object} { isAdmin, loading }
 */
export function useIsAdmin() {
  const { isAdmin, loading } = usePermissions();
  return { isAdmin: isAdmin(), loading };
}

/**
 * Componente HOC para proteger rotas/componentes baseado em permissões
 * @param {Object} props - Props do componente
 * @param {string} props.recurso - Recurso necessário
 * @param {string} props.acao - Ação necessária
 * @param {React.Component} props.children - Componente filho
 * @param {React.Component} props.fallback - Componente a mostrar se não tiver permissão
 */
export function RequirePermission({ recurso, acao, children, fallback = null }) {
  const { can, loading } = usePermissions();

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
        Verificando permissões...
      </div>
    );
  }

  if (!can(recurso, acao)) {
    return fallback || (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#ef4444',
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔒</div>
        <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>Acesso Negado</h3>
        <p style={{ color: '#94a3b8', fontSize: '14px' }}>
          Você não tem permissão para acessar este recurso.
        </p>
      </div>
    );
  }

  return children;
}