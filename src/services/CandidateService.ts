import { CandidateRepository } from '../domain/repositories/CandidateRepository';
import { Candidate, Specialty } from '../types';

export class CandidateService {
  constructor(private candidateRepository: CandidateRepository) {}

  async getAllCandidates(): Promise<Candidate[]> {
    return this.candidateRepository.findAll();
  }

  async getCandidatesBySpecialty(specialty: Specialty): Promise<Candidate[]> {
    return this.candidateRepository.findBySpecialty(specialty);
  }

  async searchCandidates(
    candidates: Candidate[],
    searchTerm: string
  ): Promise<Candidate[]> {
    if (!searchTerm.trim()) return candidates;

    const term = searchTerm.toLowerCase();
    return candidates.filter(candidate =>
      candidate.nome.toLowerCase().includes(term) ||
      candidate.inscricao.includes(term)
    );
  }

  async filterByQuota(
    candidates: Candidate[],
    quota: 'all' | 'AC' | 'PCD' | 'NI'
  ): Promise<Candidate[]> {
    if (quota === 'all') return candidates;
    if (quota === 'AC') return candidates;
    if (quota === 'PCD') return candidates.filter(c => c.pcd !== null);
    if (quota === 'NI') return candidates.filter(c => c.ni !== null);
    return candidates;
  }

  async sortCandidates(
    candidates: Candidate[],
    sortBy: 'name' | 'score' | 'classification',
    order: 'asc' | 'desc' = 'asc'
  ): Promise<Candidate[]> {
    const sorted = [...candidates].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.nome.localeCompare(b.nome);
          break;
        case 'score':
          comparison = a.nota - b.nota;
          break;
        case 'classification':
          comparison = a.ac - b.ac;
          break;
      }

      return order === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }
}