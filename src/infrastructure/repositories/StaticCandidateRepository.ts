import { CandidateRepository } from '../../domain/repositories/CandidateRepository';
import { Candidate, Specialty } from '../../types';
import csvRaw from '../../data/aprovados_classific.csv?raw';

function parseCSV(): Candidate[] {
  const lines = csvRaw.trim().split(/\r?\n/);
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(';');
      const tipo = (values[3] || '').trim();
      const especialidade: Specialty = tipo === 'TI'
        ? 'TECNOLOGIA DA INFORMAÇÃO'
        : 'GESTÃO TRIBUTÁRIA';
      const pcdStr = (values[4] || '').trim();
      return {
        inscricao: (values[0] || '').trim(),
        nome: (values[1] || '').trim(),
        ac: parseInt((values[2] || '0').trim(), 10),
        especialidade,
        pcd: pcdStr ? parseInt(pcdStr, 10) : null,
        removed: false
      } as Candidate;
    });
}

const candidatesCache: Candidate[] = parseCSV();

export class StaticCandidateRepository implements CandidateRepository {
  async findAll(): Promise<Candidate[]> {
    return [...candidatesCache];
  }

  async findBySpecialty(specialty: Specialty): Promise<Candidate[]> {
    return candidatesCache.filter(c => c.especialidade === specialty);
  }

  async save(_candidates: Candidate[]): Promise<void> {
    // Dados estáticos - operação não aplicável
  }
}
