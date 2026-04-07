import { CallOrderRepository } from '../domain/repositories/CallOrderRepository';
import { CallOrderUseCase } from '../domain/usecases/CallOrderUseCase';
import { CallOrderState, Candidate, Specialty } from '../types';

export class CallOrderService {
  constructor(
    private callOrderRepository: CallOrderRepository,
    private callOrderUseCase: CallOrderUseCase
  ) {}

  async checkExistingOrder(specialty: Specialty): Promise<CallOrderState | null> {
    return await this.callOrderRepository.load(specialty);
  }

  async initializeCallOrder(
    specialty: Specialty,
    candidates: Candidate[]
  ): Promise<CallOrderState> {
    // Try to load existing state
    const existingState = await this.callOrderRepository.load(specialty);
    
    if (existingState) {
      return existingState;
    }

    // Create initial state
    const sequence = this.getSequenceForSpecialty(specialty);
    const positions = this.callOrderUseCase.calculateCallOrder(
      candidates,
      specialty,
      [],
      sequence
    );

    const initialState: CallOrderState = {
      positions,
      removedCandidates: [],
      sequence,
      loading: false
    };

    await this.callOrderRepository.save(specialty, initialState);
    return initialState;
  }

  async removeCandidate(
    specialty: Specialty,
    candidateId: string,
    currentState: CallOrderState,
    candidates: Candidate[]
  ): Promise<CallOrderState> {
    const newState = this.callOrderUseCase.removeCandidate(
      currentState,
      candidateId,
      candidates,
      specialty
    );

    await this.callOrderRepository.save(specialty, newState);
    return newState;
  }

  async restoreCandidate(
    specialty: Specialty,
    candidateId: string,
    currentState: CallOrderState,
    candidates: Candidate[]
  ): Promise<CallOrderState> {
    const newState = this.callOrderUseCase.restoreCandidate(
      currentState,
      candidateId,
      candidates,
      specialty
    );

    await this.callOrderRepository.save(specialty, newState);
    return newState;
  }

  async updatePositionType(
    specialty: Specialty,
    position: number,
    newType: 'AC' | 'PCD' | 'NI',
    currentState: CallOrderState,
    candidates: Candidate[]
  ): Promise<CallOrderState> {
    const newState = this.callOrderUseCase.updatePositionType(
      currentState,
      position,
      newType,
      candidates,
      specialty
    );

    await this.callOrderRepository.save(specialty, newState);
    return newState;
  }

  async resetCallOrder(
    specialty: Specialty,
    candidates: Candidate[]
  ): Promise<CallOrderState> {
    await this.callOrderRepository.clear(specialty);
    return this.initializeCallOrder(specialty, candidates);
  }

  private getSequenceForSpecialty(specialty: Specialty): string[] {
    const sequences: Record<Specialty, string[]> = {
      'GESTÃO TRIBUTÁRIA': [
        'AC', 'AC', 'NI', 'AC', 'AC', 'PCD', 'AC', 'NI', 'AC', 'AC',
        'AC', 'AC', 'NI', 'AC', 'PCD', 'AC', 'AC', 'NI', 'AC', 'AC'
      ],
      'DIREITO/PROCESSO TRIBUTÁRIO': [
        'AC', 'AC', 'NI', 'AC', 'PCD', 'AC', 'AC', 'NI', 'AC', 'AC',
        'AC', 'AC', 'NI', 'AC', 'PCD', 'AC', 'AC', 'NI', 'AC', 'AC'
      ],
      'TECNOLOGIA DA INFORMAÇÃO': [
        'AC', 'AC', 'NI', 'AC', 'PCD', 'AC', 'AC', 'NI', 'AC', 'AC',
        'AC', 'AC', 'NI', 'AC', 'PCD', 'AC', 'AC', 'NI', 'AC', 'AC'
      ]
    };

    return sequences[specialty];
  }
}