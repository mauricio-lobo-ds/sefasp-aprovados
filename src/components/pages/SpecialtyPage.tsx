import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Users, Monitor, List, Megaphone, ArrowLeft, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { CandidatesList } from '../features/CandidatesList';
import { CallOrderList } from '../features/CallOrderList';
import { CandidateProfiles } from '../features/CandidateProfiles';
import { Specialty } from '../../types';

const specialtyConfig = {
  direito: {
    name: 'DIREITO/PROCESSO TRIBUTÁRIO' as Specialty,
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  gestao: {
    name: 'GESTÃO TRIBUTÁRIA' as Specialty,
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  tecnologia: {
    name: 'TECNOLOGIA DA INFORMAÇÃO' as Specialty,
    icon: Monitor,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }
};

export const SpecialtyPage: React.FC = () => {
  const { specialty } = useParams<{ specialty: string }>();
  const [activeTab, setActiveTab] = useState<'candidates' | 'callOrder' | 'profiles'>('candidates');
  const navigate = useNavigate();

  if (!specialty || !specialtyConfig[specialty as keyof typeof specialtyConfig]) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Especialidade não encontrada</h1>
          <p className="text-slate-600">A especialidade solicitada não existe.</p>
        </div>
      </div>
    );
  }

  const config = specialtyConfig[specialty as keyof typeof specialtyConfig];
  const IconComponent = config.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className={`${config.bgColor} rounded-lg p-4 md:p-6 mb-8`}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 bg-white rounded-lg flex items-center justify-center`}>
                <IconComponent className={`w-6 h-6 ${config.color}`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {config.name}
                </h1>
                <p className="text-slate-600">
                  Concurso Auditor Fiscal Tributário - Cuiabá/MT
                </p>
              </div>
            </div>
            <div className="md:self-auto">
              <Button
                variant="ghost"
                icon={ArrowLeft}
                onClick={() => navigate('/')}
                className="w-full md:w-auto"
              >
                Voltar
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Card className="mb-8">
          <CardHeader className="pb-0">
            <div className="flex space-x-1">
              <Button
                variant={activeTab === 'candidates' ? 'primary' : 'ghost'}
                icon={List}
                onClick={() => setActiveTab('candidates')}
                className="rounded-b-none flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Lista de Aprovados</span>
                <span className="sm:hidden">Lista</span>
              </Button>
              <Button
                variant={activeTab === 'callOrder' ? 'primary' : 'ghost'}
                icon={Megaphone}
                onClick={() => setActiveTab('callOrder')}
                className="rounded-b-none flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Ordem de Chamada</span>
                <span className="sm:hidden">Ordem</span>
              </Button>
              <Button
                variant={activeTab === 'profiles' ? 'primary' : 'ghost'}
                icon={UserCheck}
                onClick={() => setActiveTab('profiles')}
                className="rounded-b-none flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Perfil dos Aprovados</span>
                <span className="sm:hidden">Perfil</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {activeTab === 'candidates' ? (
              <CandidatesList specialty={config.name} />
            ) : activeTab === 'callOrder' ? (
              <CallOrderList specialty={config.name} />
            ) : (
              <CandidateProfiles specialty={config.name} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};