import React from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Candidate, Specialty } from '../../types';

interface RemovedCandidatesProps {
  removedCandidates: Candidate[];
  specialty: Specialty;
  onRestore: (candidateId: string) => Promise<void>;
}

export const RemovedCandidates: React.FC<RemovedCandidatesProps> = ({
  removedCandidates,
  specialty,
  onRestore
}) => {

  const handleRestoreCandidate = async (candidateId: string) => {
    if (window.confirm('Tem certeza que deseja restaurar este candidato na ordem de chamada?')) {
      await onRestore(candidateId);
    }
  };

  if (removedCandidates.length === 0) {
    return null;
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="bg-red-100 border-b border-red-200">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-medium text-red-800">
            Candidatos que não assumem ({removedCandidates.length})
          </h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {removedCandidates.map((candidate) => (
            <div
              key={candidate.inscricao}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <Badge variant="error">{candidate.inscricao}</Badge>
                  <span className="font-medium text-slate-900">{candidate.nome}</span>
                  <span className="text-sm text-slate-600">Nota: {candidate.nota}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="info" className="text-xs">AC: {candidate.ac}º</Badge>
                  {candidate.pcd && (
                    <Badge variant="warning" className="text-xs">PCD: {candidate.pcd}º</Badge>
                  )}
                  {candidate.ni && (
                    <Badge variant="success" className="text-xs">NI: {candidate.ni}º</Badge>
                  )}
                </div>
              </div>
              <Button
                variant="success"
                size="sm"
                icon={RotateCcw}
                onClick={() => handleRestoreCandidate(candidate.inscricao)}
              >
                Restaurar
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};