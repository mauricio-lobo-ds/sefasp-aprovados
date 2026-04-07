import { CandidateRepository } from '../../domain/repositories/CandidateRepository';
import { Candidate, Specialty } from '../../types';
import { candidatesData } from '../../data/candidatesData';

export class StaticCandidateRepository implements CandidateRepository {
  async findAll(): Promise<Candidate[]> {
    // Retorna os dados já compilados no TypeScript
    return [...candidatesData];
  }

  async findBySpecialty(specialty: Specialty): Promise<Candidate[]> {
    return candidatesData.filter(c => c.especialidade === specialty);
  }

  async save(candidates: Candidate[]): Promise<void> {
    // Em uma aplicação real, isso salvaria os dados
    // Por enquanto, apenas logamos para debug
    console.log('StaticCandidateRepository: save called with', candidates.length, 'candidates');
  }
}