import React, { useState, useMemo } from 'react';
import { Search, FileSpreadsheet } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Badge } from '../ui/Badge';
import { CandidateRow } from './CandidateRow';
import { useCandidates } from '../../hooks/useCandidates';
import { useExport } from '../../hooks/useExport';
import { Specialty, FilterState } from '../../types';

interface CandidatesListProps {
  specialty: Specialty;
}

export const CandidatesList: React.FC<CandidatesListProps> = ({ specialty }) => {
  const { candidates, loading, error } = useCandidates(specialty);
  const { exportToExcel, loading: exportLoading } = useExport();

  const [filters, setFilters] = useState<FilterState>({
    name: '',
    classification: '',
    quota: 'all',
    sortBy: 'none',
    sortOrder: 'asc'
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate => {
      const matchesName = candidate.nome.toLowerCase().includes(filters.name.toLowerCase()) ||
                         candidate.inscricao.includes(filters.name);

      const matchesClassification = filters.classification === '' ||
                                  candidate.ac.toString().includes(filters.classification);

      const matchesQuota = filters.quota === 'all' ||
                          (filters.quota === 'AC') ||
                          (filters.quota === 'PCD' && candidate.pcd !== null);

      return matchesName && matchesClassification && matchesQuota;
    });

    if (filters.sortBy !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        let comparison = 0;

        switch (filters.sortBy) {
          case 'ac':
            comparison = a.ac - b.ac;
            break;
          case 'pcd':
            const aPcd = a.pcd || 999999;
            const bPcd = b.pcd || 999999;
            comparison = aPcd - bPcd;
            break;
          case 'nome':
            comparison = a.nome.localeCompare(b.nome);
            break;
          default:
            comparison = 0;
        }

        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    return filtered;
  }, [candidates, filters]);

  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCandidates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCandidates, currentPage]);

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);

  const handleExportExcel = async () => {
    await exportToExcel(specialty, filteredCandidates);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-slate-600">Carregando candidatos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Input
          placeholder="Buscar por nome ou inscrição..."
          icon={Search}
          value={filters.name}
          onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
        />
        <Input
          placeholder="Classificação AC..."
          value={filters.classification}
          onChange={(e) => setFilters(prev => ({ ...prev, classification: e.target.value }))}
        />
        <Select
          value={filters.quota}
          onChange={(e) => setFilters(prev => ({ ...prev, quota: e.target.value as any }))}
          options={[
            { value: 'all', label: 'Todas as cotas' },
            { value: 'AC', label: 'Ampla Concorrência' },
            { value: 'PCD', label: 'PCD' }
          ]}
        />
        <Select
          value={filters.sortBy}
          onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
          options={[
            { value: 'none', label: 'Sem ordenação' },
            { value: 'ac', label: 'Classificação AC' },
            { value: 'pcd', label: 'Classificação PCD' },
            { value: 'nome', label: 'Nome' }
          ]}
        />
        {filters.sortBy !== 'none' && (
          <Select
            value={filters.sortOrder}
            onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
            options={[
              { value: 'asc', label: 'Crescente' },
              { value: 'desc', label: 'Decrescente' }
            ]}
          />
        )}
        <div className="sm:col-span-2 lg:col-span-1">
          <Button
            variant="secondary"
            icon={FileSpreadsheet}
            onClick={handleExportExcel}
            loading={exportLoading}
            className="w-full sm:w-auto"
          >
            Excel
          </Button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info">
          {filteredCandidates.length} candidatos encontrados
        </Badge>
        {filters.quota !== 'all' && (
          <Badge variant="default">
            Filtro: {filters.quota}
          </Badge>
        )}
      </div>

      {/* Table */}
      <div id="candidates-table" className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 table-fixed align-middle">
            <thead className="bg-slate-50">
              <tr className="align-middle">
                <th className="w-24 sm:w-32 px-2 sm:px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Inscrição
                </th>
                <th className="px-2 sm:px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="w-14 sm:w-16 px-2 sm:px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  AC
                </th>
                <th className="w-14 sm:w-16 px-2 sm:px-3 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  PCD
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {paginatedCandidates.map((candidate, index) => (
                <CandidateRow
                  key={candidate.inscricao}
                  candidate={candidate}
                  index={index}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            {((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, filteredCandidates.length)} de {filteredCandidates.length} candidatos
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
    </div>
  );
};
