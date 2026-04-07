import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Monitor, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';

const specialties = [
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
    <div className="bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl md:text-3xl font-bold text-slate-900 mb-6">
            Auditor Fiscal da Receita Estadual
          </h1>
          <p className="text-xl text-slate-600 mb-4">
            <a
              href="https://www.concursosfcc.com.br/concursos/fazsp125/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Concurso SEFAZ-SP (FCC)
            </a>
          </p>
          <p className="text-lg text-slate-500">
            São Paulo - SP
          </p>
          <div className="mt-8 w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Specialty Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
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

        {/* Phase Banner */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-center gap-3 bg-gray-600 text-white rounded-xl px-6 py-4 shadow-md">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-200 whitespace-nowrap">
              Fase atual
            </span>
            <div className="w-px h-5 bg-blue-400 flex-shrink-0" />
            <span className="text-base sm:text-lg font-medium text-center leading-snug">
              Resultado Preliminar das Provas Objetivas
            </span>
          </div>
        </div>

        {/* About Section */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <p className="text-slate-700 text-base sm:text-sm leading-relaxed mb-4">
            A classificação é apresentada conforme as listas de Ampla Concorrência (AC) e Pessoa com Deficiência (PCD),
            respeitando a ordem de mérito estabelecida no edital. A ordem de chamada segue as normas legais de alternância
            e proporcionalidade entre as cotas: as vagas reservadas à cota PCD ocupam as posições{' '}
            <strong>5ª, 30ª, 50ª</strong> e, a partir daí, de <strong>20 em 20</strong> (70ª, 90ª, 110ª...),
            sendo preenchidas pela AC quando não houver candidatos PCD disponíveis. Essa sistemática está prevista
            no{' '}
            <strong>art. 7º do Decreto Estadual nº 59.591/2013</strong>, com a redação vigente dada pelo{' '}
            <strong>art. 46 do Decreto nº 60.449/2014</strong>, que dispõe: <em>"Os candidatos com deficiência
            serão convocados a ocupar a 5ª, 30ª, 50ª, 70ª vagas do concurso público, e assim sucessivamente,
            a cada intervalo de 20 cargos providos."</em>
          </p>
          <p className="text-slate-700 text-base sm:text-sm leading-relaxed mb-6">
            Ao todo, serão convocados até <strong>300 candidatos de GT</strong> e <strong>100 de TI</strong>,
            sendo as primeiras <strong>150 vagas de GT</strong> e as primeiras <strong>50 de TI</strong>
            {' '}correspondentes às vagas imediatas previstas no edital. O restante compõe o{' '}
            <strong>Cadastro de Reserva (CR)</strong>, para convocações futuras conforme necessidade do órgão.
          </p>

          <div className="border-t border-slate-200 pt-4 mt-2">
            <p className="text-xs text-slate-400 leading-relaxed">
              <strong className="text-slate-500">Base legal:</strong>{' '}
              <a
                href="https://www.al.sp.gov.br/repositorio/legislacao/decreto/2013/decreto-59591-14.10.2013.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Decreto Estadual nº 59.591, de 14 de outubro de 2013
              </a>
              {' '}(art. 7º), com redação dada pelo{' '}
              <a
                href="https://www.al.sp.gov.br/repositorio/legislacao/decreto/2014/decreto-60449-15.05.2014.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Decreto Estadual nº 60.449, de 15 de maio de 2014
              </a>
              {' '}(art. 46) — ambos do Estado de São Paulo.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
