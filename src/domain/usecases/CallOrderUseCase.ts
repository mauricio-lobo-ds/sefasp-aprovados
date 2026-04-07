import { Candidate, CallPosition, CallOrderState, Specialty } from '../../types';
import { CandidateEntity } from '../entities/Candidate';

/**
 * Regras SEFAZ-SP: posições reservadas para PCD são a 5ª, a 30ª, a 50ª
 * e a partir daí de 20 em 20 (70ª, 90ª, 110ª, ...).
 */
function isPCDPosition(pos: number): boolean {
  if (pos === 5) return true;
  if (pos === 30) return true;
  if (pos >= 50 && (pos - 50) % 20 === 0) return true;
  return false;
}

export function generateSequence(totalCount: number): string[] {
  const sequence: string[] = [];
  for (let pos = 1; pos <= totalCount; pos++) {
    sequence.push(isPCDPosition(pos) ? 'PCD' : 'AC');
  }
  return sequence;
}

export class CallOrderUseCase {
  calculateCallOrder(
    candidates: Candidate[],
    specialty: Specialty,
    removedIds: string[] = [],
    sequence?: string[]
  ): CallPosition[] {
    const availableCandidates = candidates
      .filter(c => !removedIds.includes(c.inscricao))
      .map(c => new CandidateEntity(c));

    const totalCount = availableCandidates.length;
    const sequenceToUse = (sequence && sequence.length ? sequence : generateSequence(totalCount));

    // Separate candidates by quota, sorted by their classification position
    const acCandidates = [...availableCandidates].sort((a, b) => a.acPosition - b.acPosition);
    const pcdCandidates = availableCandidates
      .filter(c => c.hasQuota('PCD'))
      .sort((a, b) => (a.pcdPosition || 0) - (b.pcdPosition || 0));

    const positions: CallPosition[] = [];
    const usedCandidates = new Set<string>();

    for (let i = 0; i < sequenceToUse.length; i++) {
      const positionType = sequenceToUse[i] as 'AC' | 'PCD';
      let selectedCandidate: CandidateEntity | null = null;

      if (positionType === 'PCD') {
        selectedCandidate = this.getNextAvailableCandidate(pcdCandidates, usedCandidates);
        // Fallback to AC if no PCD available
        if (!selectedCandidate) {
          selectedCandidate = this.getNextAvailableCandidate(acCandidates, usedCandidates);
        }
      } else {
        selectedCandidate = this.getNextAvailableCandidate(acCandidates, usedCandidates);
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
    newType: 'AC' | 'PCD',
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
