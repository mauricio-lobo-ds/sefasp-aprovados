import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, Monitor, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';

const specialties = [
  {
    id: 'direito',
    title: 'DIREITO/PROCESSO TRIBUTÁRIO',
    description: 'Especialidade focada em direito tributário e processos administrativos',
    icon: FileText,
    color: 'bg-blue-500',
    path: '/direito'
  },
  {
    id: 'gestao',
    title: 'GESTÃO TRIBUTÁRIA',
    description: 'Especialidade em gestão e administração tributária',
    icon: Users,
    color: 'bg-blue-500',
    path: '/gestao'
  },
  {
    id: 'tecnologia',
    title: 'TECNOLOGIA DA INFORMAÇÃO',
    description: 'Especialidade em sistemas e tecnologia da informação',
    icon: Monitor,
    color: 'bg-blue-500',
    path: '/tecnologia'
  }
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-3xl font-bold text-slate-900 mb-6">
            Auditor Fiscal Tributário da Receita Municipal
          </h1>
          <p className="text-xl text-slate-600 mb-4">
            Concurso -{' '}
            <a
              href="https://conhecimento.fgv.br/concursos/smfcuiaba24"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Edital nº 01/2024
            </a>
          </p>
          <p className="text-lg text-slate-500">
            Cuiabá - MT
          </p>
          <div className="mt-8 w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Specialty Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {specialties.map((specialty) => {
            const IconComponent = specialty.icon;
            return (
              <Card
                key={specialty.id}
                hover
                onClick={() => navigate(specialty.path)}
                className="group"
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${specialty.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {specialty.title}
                  </h3>
                </CardHeader>
                <CardContent className="text-center">
                  <Button
                    variant="primary"
                    icon={ArrowRight}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(specialty.path);
                    }}
                    className="w-full group-hover:bg-blue-700"
                  >
                    Acessar Aprovados
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">
            Funcionalidades
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Lista de Aprovados</h3>
                  <p className="text-slate-600">Visualize todos os candidatos aprovados com filtros por nome, classificação e cotas.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Ordem de Chamada</h3>
                  <p className="text-slate-600">Geração automática da ordem de chamada conforme os arts. 23 e 24 do Decreto nº 7.436, de 25 de setembro de 2019.</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-yellow-600 font-semibold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Gestão de Candidatos</h3>
                  <p className="text-slate-600">Marque candidatos que não assumem e veja o recálculo automático da ordem de chamada.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-semibold">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Exportação</h3>
                  <p className="text-slate-600">Exporte os dados para Excel ou PDF para documentação e arquivo oficial.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};