import { useState, useEffect, useCallback } from 'react';
import { Candidate, Specialty } from '../types';
import { CandidateService } from '../services/CandidateService';
import { StaticCandidateRepository } from '../infrastructure/repositories/StaticCandidateRepository';

const candidateRepository = new StaticCandidateRepository();
const candidateService = new CandidateService(candidateRepository);

export const useCandidates = (specialty?: Specialty) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let data: Candidate[];
      if (specialty) {
        data = await candidateService.getCandidatesBySpecialty(specialty);
      } else {
        data = await candidateService.getAllCandidates();
      }

      setCandidates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, [specialty]);

  const searchCandidates = useCallback(async (searchTerm: string) => {
    try {
      const allCandidates = specialty 
        ? await candidateService.getCandidatesBySpecialty(specialty)
        : await candidateService.getAllCandidates();
      
      const filtered = await candidateService.searchCandidates(allCandidates, searchTerm);
      setCandidates(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search candidates');
    }
  }, [specialty]);

  const filterByQuota = useCallback(async (quota: 'all' | 'AC' | 'PCD' | 'NI') => {
    try {
      const allCandidates = specialty 
        ? await candidateService.getCandidatesBySpecialty(specialty)
        : await candidateService.getAllCandidates();
      
      const filtered = await candidateService.filterByQuota(allCandidates, quota);
      setCandidates(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter candidates');
    }
  }, [specialty]);

  const sortCandidates = useCallback(async (
    sortBy: 'name' | 'score' | 'classification',
    order: 'asc' | 'desc' = 'asc'
  ) => {
    try {
      const sorted = await candidateService.sortCandidates(candidates, sortBy, order);
      setCandidates(sorted);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sort candidates');
    }
  }, [candidates]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  return {
    candidates,
    loading,
    error,
    searchCandidates,
    filterByQuota,
    sortCandidates,
    refetch: loadCandidates
  };
};