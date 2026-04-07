import { Candidate, CallPosition, CallOrderState, Specialty } from '../../types';
import { CandidateEntity } from '../entities/Candidate';

export class CallOrderUseCase {
  private readonly sequences: Record<Specialty, string[]> = {
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

  calculateCallOrder(
    candidates: Candidate[],
    specialty: Specialty,
    removedIds: string[] = [],
    sequence?: string[]
  ): CallPosition[] {
    const sequenceToUse = (sequence && sequence.length ? sequence : this.sequences[specialty]);
    const availableCandidates = candidates
      .filter(c => !removedIds.includes(c.inscricao))
      .map(c => new CandidateEntity(c));

    // Separate candidates by quota
    const acCandidates = [...availableCandidates].sort((a, b) => a.acPosition - b.acPosition);
    const pcdCandidates = availableCandidates
      .filter(c => c.hasQuota('PCD'))
      .sort((a, b) => (a.pcdPosition || 0) - (b.pcdPosition || 0));
    const niCandidates = availableCandidates
      .filter(c => c.hasQuota('NI'))
      .sort((a, b) => (a.niPosition || 0) - (b.niPosition || 0));

    const positions: CallPosition[] = [];
    const usedCandidates = new Set<string>();

    for (let i = 0; i < sequenceToUse.length; i++) {
      const positionType = sequenceToUse[i] as 'AC' | 'PCD' | 'NI';
      let selectedCandidate: CandidateEntity | null = null;

      if (positionType === 'AC') {
        selectedCandidate = this.getNextAvailableCandidate(acCandidates, usedCandidates);
      } else if (positionType === 'PCD') {
        selectedCandidate = this.getNextAvailableCandidate(pcdCandidates, usedCandidates);
        // Fallback to AC if no PCD available
        if (!selectedCandidate) {
          selectedCandidate = this.getNextAvailableCandidate(acCandidates, usedCandidates);
        }
      } else if (positionType === 'NI') {
        selectedCandidate = this.getNextAvailableCandidate(niCandidates, usedCandidates);
        // Fallback to AC if no NI available
        if (!selectedCandidate) {
          selectedCandidate = this.getNextAvailableCandidate(acCandidates, usedCandidates);
        }
      }

      if (selectedCandidate) {
        usedCandidates.add(selectedCandidate.id);
      }

      positions.push({
        position: i + 1,
        type: positionType,
        candidate: selectedCandidate?.rawData || null,
        editable: true
      });
    }

    return positions;
  }

  private getNextAvailableCandidate(
    candidates: CandidateEntity[],
    usedCandidates: Set<string>
  ): CandidateEntity | null {
    return candidates.find(c => !usedCandidates.has(c.id)) || null;
  }

  removeCandidate(
    currentState: CallOrderState,
    candidateId: string,
    candidates: Candidate[],
    specialty: Specialty
  ): CallOrderState {
    const removedIds = [
      ...currentState.removedCandidates.map(c => c.inscricao),
      candidateId
    ];

    const candidateToRemove = candidates.find(c => c.inscricao === candidateId);
    const newRemovedCandidates = candidateToRemove
      ? [...currentState.removedCandidates, candidateToRemove]
      : currentState.removedCandidates;

    const newPositions = this.calculateCallOrder(
      candidates,
      specialty,
      removedIds,
      currentState.sequence
    );

    return {
      ...currentState,
      positions: newPositions,
      removedCandidates: newRemovedCandidates,
      loading: false
    };
  }

  restoreCandidate(
    currentState: CallOrderState,
    candidateId: string,
    candidates: Candidate[],
    specialty: Specialty
  ): CallOrderState {
    const newRemovedCandidates = currentState.removedCandidates.filter(
      c => c.inscricao !== candidateId
    );
    const removedIds = newRemovedCandidates.map(c => c.inscricao);

    const newPositions = this.calculateCallOrder(
      candidates,
      specialty,
      removedIds,
      currentState.sequence
    );

    return {
      ...currentState,
      positions: newPositions,
      removedCandidates: newRemovedCandidates,
      loading: false
    };
  }

  updatePositionType(
    currentState: CallOrderState,
    position: number,
    newType: 'AC' | 'PCD' | 'NI',
    candidates: Candidate[],
    specialty: Specialty
  ): CallOrderState {
    const newSequence = [...currentState.sequence];
    newSequence[position - 1] = newType;

    const removedIds = currentState.removedCandidates.map(c => c.inscricao);
    const newPositions = this.calculateCallOrder(
      candidates,
      specialty,
      removedIds,
      newSequence
    );

    return {
      ...currentState,
      sequence: newSequence,
      positions: newPositions,
      loading: false
    };
  }
}