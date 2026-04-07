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

  get score(): number {
    return this.candidate.nota;
  }

  get acPosition(): number {
    return this.candidate.ac;
  }

  get pcdPosition(): number | null {
    return this.candidate.pcd;
  }

  get niPosition(): number | null {
    return this.candidate.ni;
  }

  get birthDate(): string {
    return this.candidate.nascimento;
  }

  get isRemoved(): boolean {
    return this.candidate.removed || false;
  }

  get rawData(): CandidateType {
    return { ...this.candidate };
  }

  get formacao(): string | undefined {
    return this.candidate.formacao;
  }

  get experiencia(): string | undefined {
    return this.candidate.experiencia;
  }

  get aprovacoes(): string | undefined {
    return this.candidate.aprovacoes;
  }

  hasQuota(quota: 'PCD' | 'NI'): boolean {
    return quota === 'PCD' ? this.pcdPosition !== null : this.niPosition !== null;
  }

  getBestPosition(): number {
    const positions = [this.acPosition];
    if (this.pcdPosition) positions.push(this.pcdPosition);
    if (this.niPosition) positions.push(this.niPosition);
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