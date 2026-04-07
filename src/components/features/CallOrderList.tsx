import React, { useState, useMemo } from 'react';
import { RefreshCw, FileSpreadsheet, AlertCircle, Play } from 'lucide-react';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { CallOrderPosition } from './CallOrderPosition';
import { RemovedCandidates } from './RemovedCandidates';
import { useCandidates } from '../../hooks/useCandidates';
import { useCallOrder } from '../../hooks/useCallOrder';
import { useExport } from '../../hooks/useExport';
import { Specialty } from '../../types';

interface CallOrderListProps {
  specialty: Specialty;
}

export const CallOrderList: React.FC<CallOrderListProps> = ({ specialty }) => {
  const { candidates, loading: candidatesLoading, error: candidatesError } = useCandidates(specialty);
  const {
    callOrderState,
    error: callOrderError,
    hasOrder,
    resetCallOrder,
    generateFreshOrder,
    removeCandidate,
    updatePositionType,
    restoreCandidate
  } = useCallOrder(specialty, candidates);
  const { exportToExcel, loading: exportLoading } = useExport();

  const [currentPage, setCurrentPage] = useState(1);

  const { immediateCount, totalCalled } = specialty === 'GESTÃO TRIBUTÁRIA'
    ? { immediateCount: 150, totalCalled: 300 }
    : { immediateCount: 50, totalCalled: 100 };
  const itemsPerPage = immediateCount;

  const handleReset = async () => {
    if (window.confirm('Tem certeza que deseja resetar a ordem de chamada? Esta ação não pode ser desfeita.')) {
      await resetCallOrder();
      setCurrentPage(1);
    }
  };

  const handleGenerateFresh = async () => {
    if (hasOrder && window.confirm('Tem certeza que deseja gerar uma nova ordem de chamada? Esta ação irá limpar todos os dados salvos e recalcular a ordem.')) {
      await generateFreshOrder();
      setCurrentPage(1);
    } else if (!hasOrder) {
      await generateFreshOrder();
    }
  };

  const handleExportExcel = async () => {
    await exportToExcel(specialty, candidates, callOrderState.positions);
  };

  const cappedPositions = useMemo(() =>
    callOrderState.positions.slice(0, totalCalled),
    [callOrderState.positions, totalCalled]
  );

  const paginatedPositions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return cappedPositions.slice(startIndex, startIndex + itemsPerPage);
  }, [cappedPositions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(cappedPositions.length / itemsPerPage);
  const isImmediatePage = currentPage === 1;

  if (candidatesLoading || callOrderState.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-slate-600">
          {candidatesLoading ? 'Carregando candidatos...' : 'Calculando ordem de chamada...'}
        </span>
      </div>
    );
  }

  if (candidatesError || callOrderError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{candidatesError || callOrderError}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  if (!hasOrder) {
    return (
      <div className="space-y-6">
        <div className="text-center py-16">
          <Play className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <p className="text-slate-600 mb-8 text-lg">
            Clique para gerar a ordem de chamada para {specialty}
          </p>
          <Button
            variant="primary"
            icon={Play}
            onClick={handleGenerateFresh}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            loading={callOrderState.loading}
          >
            Gerar Ordem
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Ordem de Chamada</h2>
          <p className="text-slate-600">
            {cappedPositions.length} candidatos convocados para {specialty === 'GESTÃO TRIBUTÁRIA' ? 'GT' : 'TI'}
            {' '}({immediateCount} vagas imediatas + {totalCalled - immediateCount} CR)
          </p>
        </div>
        <div className="flex flex-wrap space-x-2 gap-2">
          <Button
            variant="ghost"
            icon={RefreshCw}
            onClick={handleReset}
            className="text-slate-600"
          >
            Resetar
          </Button>
          <Button
            variant="secondary"
            icon={FileSpreadsheet}
            onClick={handleExportExcel}
            loading={exportLoading}
          >
            Excel
          </Button>
        </div>
      </div>

      {/* Removed Candidates */}
      {callOrderState.removedCandidates.length > 0 && (
        <RemovedCandidates
          removedCandidates={callOrderState.removedCandidates}
          specialty={specialty}
          onRestore={restoreCandidate}
        />
      )}

      {/* Call Order Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-900">
              Posições de Chamada
            </h3>
            {isImmediatePage ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Vagas Imediatas (1º–{immediateCount}º)
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                Cadastro de Reserva — CR ({immediateCount + 1}º–{totalCalled}º)
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div id="call-order-table" className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 table-fixed align-middle">
              <thead className="bg-slate-50">
                <tr className="align-middle">
                  <th className="w-20 px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Posição
                  </th>
                  <th className="w-20 px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="w-32 px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Inscrição
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="w-28 px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider export-hide-pdf">
                    Não Assume
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {paginatedPositions.map((position, index) => (
                  <CallOrderPosition
                    key={position.position}
                    position={position}
                    index={index}
                    specialty={specialty}
                    isImmediate={isImmediatePage}
                    onRemove={removeCandidate}
                    onUpdateType={(pos, type) => updatePositionType(pos, type)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-slate-200">
              <div className="text-sm text-slate-600 text-center sm:text-left">
                <span className="font-medium">{isImmediatePage ? 'Vagas Imediatas' : 'Cadastro de Reserva (CR)'}</span>
                <span className="text-slate-400">
                  {' '}— {((currentPage - 1) * itemsPerPage) + 1}º a {Math.min(currentPage * itemsPerPage, cappedPositions.length)}º
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  ← Anterior
                </Button>
                <span className="px-3 py-1.5 text-sm text-slate-600 bg-slate-100 rounded-md whitespace-nowrap">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Próxima →
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent>
          <h4 className="font-medium text-slate-900 mb-3">Legenda:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded flex-shrink-0"></div>
              <span className="text-slate-600">AC — Ampla Concorrência</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded flex-shrink-0"></div>
              <span className="text-slate-600">PCD — Pessoa com Deficiência (5ª, 30ª, 50ª, 70ª...)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded flex-shrink-0"></div>
              <span className="text-slate-600">Vaga Imediata — prevista no edital</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-white border border-slate-300 rounded flex-shrink-0"></div>
              <span className="text-slate-600">Cadastro de Reserva (CR) — convocação futura</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
