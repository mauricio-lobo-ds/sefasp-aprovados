import { useState, useEffect } from 'react';

export interface ProfileFormacao {
  curso: string;
  tipo: 'graduacao' | 'pos_graduacao' | 'mestrado' | 'doutorado';
}

export interface ProfileExperiencia {
  [key: string]: any; // Interface totalmente dinâmica para capturar qualquer campo
}

export interface ProfileAprovacao {
  [key: string]: any; // Interface totalmente dinâmica para capturar qualquer campo
}

export interface ApprovedProfile {
  nome: string;
  formacao?: ProfileFormacao[];
  experiencia_profissional?: ProfileExperiencia[];
  expertise?: string[];
  aprovacoes?: ProfileAprovacao[];
}

interface ApprovedData {
  profissionais: ApprovedProfile[];
}

export const useApprovedProfiles = () => {
  const [profiles, setProfiles] = useState<Map<string, ApprovedProfile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        setLoading(true);
        // Usar fetch para carregar do arquivo público (funciona na build)
        const response = await fetch('/aprovados-info.json', {
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (!response.ok) {
          throw new Error('Erro ao carregar dados dos perfis');
        }

        const data: ApprovedData = await response.json();
        
        // Criar um Map indexado pelo nome completo
        const profilesMap = new Map<string, ApprovedProfile>();
        data.profissionais.forEach(profile => {
          profilesMap.set(profile.nome, profile);
        });

        setProfiles(profilesMap);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar perfis dos aprovados:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);

  const getProfile = (candidateName: string): ApprovedProfile | null => {
    return profiles.get(candidateName) || null;
  };

  const formatFormacao = (formacao?: ProfileFormacao[]): string => {
    if (!formacao || formacao.length === 0) return 'Não informado';
    
    return formacao.map(f => {
      const tipoMap = {
        'graduacao': 'Graduação',
        'pos_graduacao': 'Pós-graduação',
        'mestrado': 'Mestrado',
        'doutorado': 'Doutorado'
      };
      return `${tipoMap[f.tipo]}: ${f.curso}`;
    }).join('\n');
  };

  const formatExperiencia = (experiencia?: ProfileExperiencia[]): string => {
    if (!experiencia || experiencia.length === 0) return 'Não informado';
    
    return experiencia.map(exp => {
      const parts: string[] = [];
      
      // Lista de campos a ignorar (arrays ou objetos complexos tratados separadamente)
      const ignoredFields = ['atividades', 'expertise', 'sistemas'];
      
      // Capturar todos os campos string do objeto
      Object.entries(exp).forEach(([key, value]) => {
        if (ignoredFields.includes(key)) return;
        
        if (typeof value === 'string' && value.trim()) {
          let fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
          // Trocar "Empresa" por "Instituição"
          if (fieldName === 'Empresa') {
            fieldName = 'Instituição';
          }
          parts.push(`${fieldName}: ${value}`);
        }
      });
      
      return parts.length > 0 ? parts.join(' | ') : 'Experiência informada';
    }).join(' • ');
  };

  const getExperienciaDetails = (experiencia?: ProfileExperiencia[]) => {
    if (!experiencia || experiencia.length === 0) return { activities: [], expertise: [], systems: [] };
    
    const details = {
      activities: [] as string[],
      expertise: [] as string[],
      systems: [] as string[]
    };
    
    experiencia.forEach(exp => {
      // Capturar atividades
      if (exp.atividades && Array.isArray(exp.atividades)) {
        details.activities.push(...exp.atividades);
      }
      
      // Capturar expertise (pode estar dentro de experiencia_profissional ou no nível raiz)
      if (exp.expertise && Array.isArray(exp.expertise)) {
        details.expertise.push(...exp.expertise);
      }
      
      // Capturar sistemas
      if (exp.sistemas && Array.isArray(exp.sistemas)) {
        details.systems.push(...exp.sistemas);
      }
    });
    
    return details;
  };

  const formatAprovacoes = (aprovacoes?: ProfileAprovacao[]): string => {
    if (!aprovacoes || aprovacoes.length === 0) return 'Não informado';
    
    return aprovacoes.map(aprov => {
      const parts: string[] = [];
      
      // Capturar todos os campos dinamicamente
      Object.entries(aprov).forEach(([key, value]) => {
        if (typeof value === 'string' && value.trim()) {
          if (key === 'concurso') {
            parts.unshift(value); // Concurso vem primeiro
          } else if (key === 'cargo') {
            parts.push(value);
          } else if (key === 'classificacao') {
            const posicaoFormatted = aprov.posicao || `${value}º`;
            parts.push(`(${posicaoFormatted})`);
          } else if (key !== 'posicao') {
            // Outros campos que possam existir
            const fieldName = key.charAt(0).toUpperCase() + key.slice(1);
            parts.push(`${fieldName}: ${value}`);
          }
        }
      });
      
      return parts.join(' - ');
    }).join('\n');
  };

  return {
    profiles,
    loading,
    error,
    getProfile,
    formatFormacao,
    formatExperiencia,
    formatAprovacoes,
    getExperienciaDetails
  };
};