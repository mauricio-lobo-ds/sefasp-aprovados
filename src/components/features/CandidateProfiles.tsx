import React from 'react';
import { Calendar, GraduationCap, Briefcase, Award, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Specialty } from '../../types';
import { useCallOrder } from '../../hooks/useCallOrder';
import { useCandidates } from '../../hooks/useCandidates';
import { useApprovedProfiles } from '../../hooks/useApprovedProfiles';

interface CandidateProfilesProps {
  specialty: Specialty;
}

export const CandidateProfiles: React.FC<CandidateProfilesProps> = ({ specialty }) => {
  const { candidates, loading: candidatesLoading } = useCandidates(specialty);
  const { callOrderState } = useCallOrder(specialty, candidates);
  const { getProfile, formatFormacao, formatExperiencia, formatAprovacoes, getExperienciaDetails, loading: profilesLoading } = useApprovedProfiles();

  const calledCandidates = callOrderState.positions
    .filter(pos => pos.candidate !== null)
    .map(pos => pos.candidate!)
    .slice(0, 20);

  if (candidatesLoading || callOrderState.loading || profilesLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 mb-4">
          <UserCheck className="w-12 h-12 mx-auto animate-pulse" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          Carregando perfis...
        </h3>
        <p className="text-slate-500">
          Aguarde enquanto calculamos a ordem de chamada.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Perfil dos Aprovados
        </h2>
        <Badge variant="outline" className="text-sm">
          {calledCandidates.length} candidatos
        </Badge>
      </div>

      <div id="candidate-profiles-content" className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {calledCandidates.map((candidate, index) => {
          const profile = getProfile(candidate.nome);
          const experienciaDetails = profile ? getExperienciaDetails(profile.experiencia_profissional) : null;
          
          // Calcular idade
          const calculateAge = (birthDate: string): number => {
            const [day, month, year] = birthDate.split('/').map(Number);
            const birth = new Date(year, month - 1, day);
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
              age--;
            }
            
            return age;
          };
          
          const age = calculateAge(candidate.nascimento);
          
          return (
            <Card key={candidate.inscricao} className="hover:shadow-md transition-shadow overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between min-w-0">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-900 leading-tight break-words">
                      {candidate.nome}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1 break-words">
                      Inscrição: {candidate.inscricao}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-2 text-xs flex-shrink-0">
                    #{index + 1}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Data de Nascimento */}
                <div className="flex items-center space-x-2 min-w-0">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="text-sm text-slate-600 break-words">
                    {candidate.nascimento} ({age} anos)
                  </span>
                </div>

                {/* Formação */}
                <div className="flex items-start space-x-2 min-w-0">
                  <GraduationCap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Formação
                    </p>
                    <div className="text-sm text-slate-700">
                      {profile ? (
                        formatFormacao(profile.formacao).split('\n').map((linha, i) => (
                          <p key={i} className="mb-1 last:mb-0 break-words">{linha}</p>
                        ))
                      ) : (
                        <p className="break-words">{candidate.formacao || 'Não informado'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Experiência */}
                <div className="flex items-start space-x-2 min-w-0">
                  <Briefcase className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Experiência
                    </p>
                    <p className="text-sm text-slate-700 break-words">
                      {profile ? formatExperiencia(profile.experiencia_profissional) : (candidate.experiencia || 'Não informado')}
                    </p>
                    
                    {/* Atividades */}
                    {experienciaDetails?.activities.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-500 mb-1">Principais atividades:</p>
                        <div className="space-y-0.5">
                          {experienciaDetails.activities.map((atividade, i) => (
                            <p key={i} className="text-xs text-slate-600 break-words">
                              • {atividade}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expertise dentro da experiência */}
                    {experienciaDetails?.expertise.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-500 mb-1">Expertise profissional:</p>
                        <div className="space-y-0.5">
                          {experienciaDetails.expertise.map((exp, i) => (
                            <p key={i} className="text-xs text-slate-600 break-words">
                              • {exp}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sistemas */}
                    {experienciaDetails?.systems.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-500 mb-1">Sistemas/Tecnologias:</p>
                        <p className="text-xs text-slate-600 break-words">
                          {experienciaDetails.systems.join(', ')}
                        </p>
                      </div>
                    )}

                    {/* Expertise geral (dentro da experiência) */}
                    {profile?.expertise && profile.expertise.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-500 mb-1">Expertise geral:</p>
                        <div className="space-y-0.5">
                          {profile.expertise.map((exp, i) => (
                            <p key={i} className="text-xs text-slate-600 break-words">
                              • {exp}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Aprovações */}
                <div className="flex items-start space-x-2 min-w-0">
                  <Award className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Aprovações
                    </p>
                    <div className="text-sm text-slate-700">
                      {profile ? (
                        formatAprovacoes(profile.aprovacoes).split('\n').map((linha, i) => (
                          <p key={i} className="mb-1 last:mb-0 break-words">{linha}</p>
                        ))
                      ) : (
                        <p className="break-words">{candidate.aprovacoes || 'Não informado'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {calledCandidates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <UserCheck className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Nenhum candidato chamado
          </h3>
          <p className="text-slate-500">
            Configure a ordem de chamada para ver os perfis dos candidatos.
          </p>
        </div>
      )}
    </div>
  );
};