import React, { useState } from 'react';
import { X, Edit3, Check, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { CallPosition, Specialty } from '../../types';

interface CallOrderPositionProps {
  position: CallPosition;
  index: number;
  specialty: Specialty;
  onRemove: (candidateId: string) => Promise<void>;
  onUpdateType: (position: number, newType: 'AC' | 'PCD' | 'NI') => Promise<void>;
}

export const CallOrderPosition: React.FC<CallOrderPositionProps> = ({
  position,
  index,
  specialty,
  onRemove,
  onUpdateType
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingType, setEditingType] = useState(position.type);

  const isEven = index % 2 === 0;

  const handleRemoveCandidate = async () => {
    if (!position.candidate) return;
    
    if (window.confirm(`Tem certeza que deseja marcar ${position.candidate.nome} como "não assume"?`)) {
      await onRemove(position.candidate.inscricao);
    }
  };

  const handleUpdateType = async () => {
    await onUpdateType(position.position, editingType);
    setIsEditing(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'AC': return 'info';
      case 'PCD': return 'warning';
      case 'NI': return 'success';
      default: return 'default';
    }
  };

  const getTypeBgColor = (type: string) => {
    switch (type) {
      case 'AC': return 'bg-blue-50';
      case 'PCD': return 'bg-yellow-50';
      case 'NI': return 'bg-green-50';
      default: return 'bg-slate-50';
    }
  };

  return (
    <tr className={`group ${isEven ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}>
      <td className="w-20 px-3 py-2 whitespace-nowrap align-middle">
        <div className="flex items-center">
          <span className="text-lg font-bold text-slate-900 mr-2">
            {position.position}º
          </span>
        </div>
      </td>
      <td className="w-20 px-3 py-2 whitespace-nowrap align-middle">
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <Select
              value={editingType}
              onChange={(e) => setEditingType(e.target.value as 'AC' | 'PCD' | 'NI')}
              options={[
                { value: 'AC', label: 'AC' },
                { value: 'PCD', label: 'PCD' },
                { value: 'NI', label: 'NI' }
              ]}
              className="w-24 text-xs"
            />
            <button
              onClick={handleUpdateType}
              className="w-4 h-4 text-green-600 hover:text-green-700 inline-flex items-center justify-center"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditingType(position.type);
              }}
              className="w-4 h-4 text-red-600 hover:text-red-700 inline-flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Badge variant={getTypeColor(position.type)} className={getTypeBgColor(position.type)}>
              {position.type}
            </Badge>
            {position.editable && (
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-60 hover:opacity-100 transition-opacity w-4 h-4 text-slate-400 hover:text-slate-600 export-hide-pdf inline-flex items-center justify-center align-middle"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </td>
      <td className="w-28 px-3 py-2 whitespace-nowrap text-sm font-medium text-slate-900 align-middle">
        {position.candidate?.inscricao || (
          <span className="text-slate-400 italic">Vago</span>
        )}
      </td>
      <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-900 align-middle">
        {position.candidate?.nome || (
          <div className="flex items-center text-slate-400 italic">
            <AlertTriangle className="w-4 h-4 mr-1" />
            Nenhum candidato disponível
          </div>
        )}
      </td>
      <td className="w-16 px-3 py-2 whitespace-nowrap text-sm font-semibold text-slate-900 align-middle">
        {position.candidate?.nota || (
          <span className="text-slate-400">-</span>
        )}
      </td>
      <td className="w-28 px-3 py-2 whitespace-nowrap text-sm text-slate-900 align-middle export-hide-pdf">
        <div className="flex items-center">
          {position.candidate && (
            <button
              onClick={handleRemoveCandidate}
              className="opacity-60 hover:opacity-100 transition-opacity w-4 h-4 text-red-400 hover:text-red-600 export-hide-pdf inline-flex items-center justify-center align-middle"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};