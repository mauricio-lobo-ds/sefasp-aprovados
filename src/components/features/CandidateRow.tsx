import React from 'react';
import { Badge } from '../ui/Badge';
import { Candidate } from '../../types';

interface CandidateRowProps {
  candidate: Candidate;
  index: number;
}

export const CandidateRow: React.FC<CandidateRowProps> = ({ candidate, index }) => {
  const isEven = index % 2 === 0;

  return (
    <tr className={`${isEven ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}>
      <td className="px-2 sm:px-3 py-1.5 whitespace-nowrap text-xs font-medium text-slate-900 align-middle">
        {candidate.inscricao}
      </td>
      <td className="px-2 sm:px-3 py-1.5 text-xs text-slate-900 align-middle whitespace-nowrap">
        {candidate.nome}
      </td>
      <td className="px-2 sm:px-3 py-1.5 whitespace-nowrap text-xs text-slate-900 align-middle">
        <Badge variant="info">{candidate.ac}º</Badge>
      </td>
      <td className="px-2 sm:px-3 py-1.5 whitespace-nowrap text-xs text-slate-900 align-middle">
        {candidate.pcd ? (
          <Badge variant="warning">{candidate.pcd}º</Badge>
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </td>
    </tr>
  );
};
