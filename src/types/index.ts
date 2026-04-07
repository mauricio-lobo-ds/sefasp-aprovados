// Domain Types
export interface Candidate {
  especialidade: string;
  inscricao: string;
  nome: string;
  nascimento: string;
  nota: number;
  ac: number;
  pcd: number | null;
  ni: number | null;
  formacao?: string;
  experiencia?: string;
  aprovacoes?: string;
  removed?: boolean;
}

export interface CallPosition {
  position: number;
  type: 'AC' | 'PCD' | 'NI';
  candidate: Candidate | null;
  editable: boolean;
}

export interface CallOrderState {
  positions: CallPosition[];
  removedCandidates: Candidate[];
  sequence: string[];
  loading: boolean;
}

export interface FilterState {
  name: string;
  classification: string;
  quota: 'all' | 'AC' | 'PCD' | 'NI';
  sortBy: 'none' | 'ac' | 'pcd' | 'ni' | 'nota' | 'nome';
  sortOrder: 'asc' | 'desc';
}

export type Specialty = 'DIREITO/PROCESSO TRIBUTÁRIO' | 'GESTÃO TRIBUTÁRIA' | 'TECNOLOGIA DA INFORMAÇÃO';

export interface SpecialtyConfig {
  name: Specialty;
  sequence: string[];
  color: string;
  icon: string;
}