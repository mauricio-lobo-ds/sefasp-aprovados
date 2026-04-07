import { CallOrderRepository } from '../../domain/repositories/CallOrderRepository';
import { CallOrderState, Specialty } from '../../types';

export class LocalStorageCallOrderRepository implements CallOrderRepository {
  private getKey(specialty: Specialty): string {
    return `callOrder_${specialty.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  async save(specialty: Specialty, state: CallOrderState): Promise<void> {
    try {
      const key = this.getKey(specialty);
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving call order state:', error);
      throw new Error('Failed to save call order state');
    }
  }

  async load(specialty: Specialty): Promise<CallOrderState | null> {
    try {
      const key = this.getKey(specialty);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading call order state:', error);
      return null;
    }
  }

  async clear(specialty: Specialty): Promise<void> {
    try {
      const key = this.getKey(specialty);
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing call order state:', error);
      throw new Error('Failed to clear call order state');
    }
  }
}