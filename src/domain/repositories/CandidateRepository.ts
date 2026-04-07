import { Candidate, Specialty } from '../../types';

export interface CandidateRepository {
  findAll(): Promise<Candidate[]>;
  findBySpecialty(specialty: Specialty): Promise<Candidate[]>;
  save(candidates: Candidate[]): Promise<void>;
  loadFromCSV(): Promise<Candidate[]>;
}