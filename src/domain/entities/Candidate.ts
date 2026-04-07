import { Candidate as CandidateType } from '../../types';

export class CandidateEntity {
  constructor(private candidate: CandidateType) {}

  get id(): string {
    return this.candidate.inscricao;
  }

  get name(): string {
    return this.candidate.nome;
  }

  get specialty(): string {
    return this.candidate.especialidade;
  }

  get acPosition(): number {
    return this.candidate.ac;
  }

  get pcdPosition(): number | null {
    return this.candidate.pcd;
  }

  get isRemoved(): boolean {
    return this.candidate.removed || false;
  }

  get rawData(): CandidateType {
    return { ...this.candidate };
  }

  hasQuota(quota: 'PCD'): boolean {
    return this.pcdPosition !== null;
  }

  getBestPosition(): number {
    const positions = [this.acPosition];
    if (this.pcdPosition) positions.push(this.pcdPosition);
    return Math.min(...positions);
  }

  markAsRemoved(): CandidateEntity {
    return new CandidateEntity({
      ...this.candidate,
      removed: true
    });
  }

  restore(): CandidateEntity {
    return new CandidateEntity({
      ...this.candidate,
      removed: false
    });
  }
}