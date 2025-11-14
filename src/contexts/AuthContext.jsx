import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Context de Tema
 * Gerencia tema da aplicação (dark/light) com persistência
 * 
 * @context ThemeContext
 * @author Michelc Assessoria Contábil
 * @version 3.0.0
 */
const ThemeContext = createContext();

/**
 * Definição dos temas disponíveis
 */
const themes = {
  dark: 'dark',
  light: 'light',
};

/**
 * Provider de tema
 * Fornece funcionalidades de troca de tema com persistência no localStorage
 * 
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Componentes filhos
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Recuperar tema salvo ou usar dark como padrão
    const savedTheme = localStorage.getItem('app_theme');
    return savedTheme && themes[savedTheme] ? savedTheme : themes.dark;
  });

  useEffect(() => {
    // Persistir tema no localStorage
    localStorage.setItem('app_theme', theme);
    
    // Aplicar tema no body
    document.body.setAttribute('data-theme', theme);
    
    // Aplicar classe no html para maior compatibilidade
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  /**
   * Alterna entre tema claro e escuro
   */
  const toggleTheme = () => {
    setTheme(prevTheme => 
      prevTheme === themes.dark ? themes.light : themes.dark
    );
  };

  /**
   * Define tema específico
   * @param {string} newTheme - Tema a ser aplicado ('dark' ou 'light')
   */
  const setSpecificTheme = (newTheme) => {
    if (themes[newTheme]) {
      setTheme(newTheme);
    }
  };

  const value = {
    theme,
    isDark: theme === themes.dark,
    isLight: theme === themes.light,
    toggleTheme,
    setTheme: setSpecificTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de tema
 * @returns {Object} Contexto de tema
 * @throws {Error} Se usado fora do ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
}
