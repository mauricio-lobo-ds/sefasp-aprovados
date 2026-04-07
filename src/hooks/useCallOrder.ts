import { useState, useEffect, useCallback, useMemo } from 'react';
import { CallOrderState, Candidate, Specialty } from '../types';
import { CallOrderService } from '../services/CallOrderService';
import { CallOrderUseCase } from '../domain/usecases/CallOrderUseCase';
import { LocalStorageCallOrderRepository } from '../infrastructure/repositories/LocalStorageCallOrderRepository';

export const useCallOrder = (specialty: Specialty, candidates: Candidate[]) => {
  const callOrderService = useMemo(() => {
    const callOrderRepository = new LocalStorageCallOrderRepository();
    const callOrderUseCase = new CallOrderUseCase();
    return new CallOrderService(callOrderRepository, callOrderUseCase);
  }, []);

  const [callOrderState, setCallOrderState] = useState<CallOrderState>({
    positions: [],
    removedCandidates: [],
    sequence: [],
    loading: false
  });

  const [error, setError] = useState<string | null>(null);
  const [lastSpecialty, setLastSpecialty] = useState<Specialty | null>(null);
  const [hasOrder, setHasOrder] = useState<boolean>(false);

  const checkExistingOrder = useCallback(async () => {
    if (candidates.length === 0) return;

    try {
      setError(null);
      const existingState = await callOrderService.checkExistingOrder(specialty);
      
      if (existingState) {
        setCallOrderState(existingState);
        setHasOrder(true);
      } else {
        setHasOrder(false);
        setCallOrderState({
          positions: [],
          removedCandidates: [],
          sequence: [],
          loading: false
        });
      }
      setLastSpecialty(specialty);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check existing order');
      setHasOrder(false);
    }
  }, [specialty, candidates.length, callOrderService]);

  const removeCandidate = useCallback(async (candidateId: string) => {
    try {
      setCallOrderState(prev => ({ ...prev, loading: true }));
      setError(null);

      const newState = await callOrderService.removeCandidate(
        specialty,
        candidateId,
        callOrderState,
        candidates
      );
      setCallOrderState(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove candidate');
      setCallOrderState(prev => ({ ...prev, loading: false }));
    }
  }, [specialty, callOrderState, candidates, callOrderService]);

  const restoreCandidate = useCallback(async (candidateId: string) => {
    try {
      setCallOrderState(prev => ({ ...prev, loading: true }));
      setError(null);

      const newState = await callOrderService.restoreCandidate(
        specialty,
        candidateId,
        callOrderState,
        candidates
      );
      setCallOrderState(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore candidate');
      setCallOrderState(prev => ({ ...prev, loading: false }));
    }
  }, [specialty, callOrderState, candidates, callOrderService]);

  const updatePositionType = useCallback(async (
    position: number,
    newType: 'AC' | 'PCD' | 'NI'
  ) => {
    try {
      setCallOrderState(prev => ({ ...prev, loading: true }));
      setError(null);

      const newState = await callOrderService.updatePositionType(
        specialty,
        position,
        newType,
        callOrderState,
        candidates
      );
      setCallOrderState(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update position type');
      setCallOrderState(prev => ({ ...prev, loading: false }));
    }
  }, [specialty, callOrderState, candidates, callOrderService]);

  const resetCallOrder = useCallback(async () => {
    try {
      setCallOrderState(prev => ({ ...prev, loading: true }));
      setError(null);

      const newState = await callOrderService.resetCallOrder(specialty, candidates);
      setCallOrderState(newState);
      setLastSpecialty(specialty);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset call order');
      setCallOrderState(prev => ({ ...prev, loading: false }));
    }
  }, [specialty, candidates, callOrderService]);

  const generateFreshOrder = useCallback(async () => {
    try {
      setCallOrderState(prev => ({ ...prev, loading: true }));
      setError(null);

      await callOrderService.resetCallOrder(specialty, candidates);
      const newState = await callOrderService.initializeCallOrder(specialty, candidates);
      setCallOrderState(newState);
      setHasOrder(true);
      setLastSpecialty(specialty);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate fresh order');
      setCallOrderState(prev => ({ ...prev, loading: false }));
      setHasOrder(false);
    }
  }, [specialty, candidates, callOrderService]);

  useEffect(() => {
    if (lastSpecialty !== specialty) {
      setCallOrderState({
        positions: [],
        removedCandidates: [],
        sequence: [],
        loading: false
      });
      setError(null);
      setHasOrder(false);
    }
    checkExistingOrder();
  }, [checkExistingOrder, specialty, lastSpecialty]);

  return {
    callOrderState,
    error,
    hasOrder,
    removeCandidate,
    restoreCandidate,
    updatePositionType,
    resetCallOrder,
    generateFreshOrder,
    refetch: checkExistingOrder
  };
};