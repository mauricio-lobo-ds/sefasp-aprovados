import { useCallback, useState } from 'react';
import { ExportService } from '../services/ExportService';
import { Candidate, CallPosition, Specialty } from '../types';

const exportService = new ExportService();

export const useExport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportToExcel = useCallback(async (
    specialty: Specialty,
    candidates: Candidate[],
    callOrder?: CallPosition[]
  ) => {
    try {
      setLoading(true);
      setError(null);
      await exportService.exportToExcel(specialty, candidates, callOrder);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export to Excel');
    } finally {
      setLoading(false);
    }
  }, []);

  const exportToPDF = useCallback(async (
    specialty: Specialty,
    elementId: string,
    options?: { title?: string; subtitle?: string; removedCandidates?: Candidate[] }
  ) => {
    try {
      setLoading(true);
      setError(null);
      await exportService.exportToPDF(specialty, elementId, options);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export to PDF');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    exportToExcel,
    exportToPDF
  };
};