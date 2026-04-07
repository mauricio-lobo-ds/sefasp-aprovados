import { CallOrderState, Specialty } from '../../types';

export interface CallOrderRepository {
  save(specialty: Specialty, state: CallOrderState): Promise<void>;
  load(specialty: Specialty): Promise<CallOrderState | null>;
  clear(specialty: Specialty): Promise<void>;
}