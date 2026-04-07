import { CandidateRepository } from '../../domain/repositories/CandidateRepository';
import { Candidate, Specialty } from '../../types';

export class CSVCandidateRepository implements CandidateRepository {
  private candidates: Candidate[] = [];

  async findAll(): Promise<Candidate[]> {
    if (this.candidates.length === 0) {
      await this.loadFromCSV();
    }
    return [...this.candidates];
  }

  async findBySpecialty(specialty: Specialty): Promise<Candidate[]> {
    const allCandidates = await this.findAll();
    return allCandidates.filter(c => c.especialidade === specialty);
  }

  async save(candidates: Candidate[]): Promise<void> {
    this.candidates = [...candidates];
  }

  async loadFromCSV(): Promise<Candidate[]> {
    try {
      // Tenta carregar o CSV real hospedado em /public
      try {
        const response = await fetch('/dados-aprovados.csv', {
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (response.ok) {
          const text = await response.text();
          const lines = text.trim().split(/\r?\n/);
          this.candidates = lines.slice(1).map(rawLine => {
            const values = rawLine.replace(/\r$/, '').split(';').map(v => v.trim());
            const toNumber = (v: string): number => {
              const n = parseInt(v, 10);
              return isNaN(n) ? 0 : n;
            };
            const toOptionalNumber = (v: string): number | null => {
              const trimmed = (v || '').trim();
              if (trimmed === '') return null;
              const n = parseInt(trimmed, 10);
              return isNaN(n) ? null : n;
            };
            return {
              especialidade: values[0] || '',
              inscricao: values[1] || '',
              nome: values[2] || '',
              nascimento: values[3] || '',
              nota: toNumber(values[4] || '0'),
              ac: toNumber(values[5] || '0'),
              pcd: toOptionalNumber(values[6] || ''),
              ni: toOptionalNumber(values[7] || ''),
              formacao: values[8] || undefined,
              experiencia: values[9] || undefined,
              aprovacoes: values[10] || undefined,
              removed: false
            } as Candidate;
          });
          return this.candidates;
        }
      } catch (_) {
        // Ignora e usa o mock abaixo como fallback
      }
      // In a real application, this would load from the actual CSV file
      // For now, we'll use mock data that matches the CSV structure
      const mockData = `Especialidade;Inscrição;Nome;Nascimento;Nota;AC;PCD;NI
DIREITO/PROCESSO TRIBUTÁRIO;850002684;Igor Silva Do Livramento;19/09/1981;171;1;;
DIREITO/PROCESSO TRIBUTÁRIO;850002685;Maria Santos Silva;15/03/1985;169;2;1;
DIREITO/PROCESSO TRIBUTÁRIO;850002686;João Pedro Oliveira;22/07/1990;167;3;;1
DIREITO/PROCESSO TRIBUTÁRIO;850002687;Ana Carolina Lima;10/12/1988;165;4;;
DIREITO/PROCESSO TRIBUTÁRIO;850002688;Carlos Eduardo Santos;05/06/1992;163;5;2;
DIREITO/PROCESSO TRIBUTÁRIO;850002689;Fernanda Costa Alves;18/09/1987;161;6;;2
DIREITO/PROCESSO TRIBUTÁRIO;850002690;Roberto Silva Junior;25/01/1991;159;7;;
DIREITO/PROCESSO TRIBUTÁRIO;850002691;Juliana Pereira Rocha;30/04/1989;157;8;3;
DIREITO/PROCESSO TRIBUTÁRIO;850002692;Marcos Antonio Dias;12/11/1986;155;9;;3
DIREITO/PROCESSO TRIBUTÁRIO;850002693;Patricia Fernandes;08/08/1993;153;10;;
DIREITO/PROCESSO TRIBUTÁRIO;850002694;Ricardo Almeida;14/02/1984;151;11;4;
DIREITO/PROCESSO TRIBUTÁRIO;850002695;Luciana Barbosa;27/05/1990;149;12;;4
DIREITO/PROCESSO TRIBUTÁRIO;850002696;Anderson Moreira;03/10/1988;147;13;;
DIREITO/PROCESSO TRIBUTÁRIO;850002697;Camila Rodrigues;21/07/1991;145;14;5;
DIREITO/PROCESSO TRIBUTÁRIO;850002698;Felipe Nascimento;16/12/1987;143;15;;5
DIREITO/PROCESSO TRIBUTÁRIO;850002699;Gabriela Martins;09/03/1992;141;16;;
DIREITO/PROCESSO TRIBUTÁRIO;850002700;Thiago Souza;24/06/1989;139;17;6;
DIREITO/PROCESSO TRIBUTÁRIO;850002701;Renata Carvalho;11/01/1990;137;18;;6
DIREITO/PROCESSO TRIBUTÁRIO;850002702;Bruno Ferreira;28/08/1985;135;19;;
DIREITO/PROCESSO TRIBUTÁRIO;850002703;Vanessa Lima;06/04/1993;133;20;7;
GESTÃO TRIBUTÁRIA;850002740;José Antonio Pontes Da Silva Filho;22/08/1995;189;1;;
GESTÃO TRIBUTÁRIA;850002741;Maria Eduarda Santos;15/03/1990;187;2;1;
GESTÃO TRIBUTÁRIA;850002742;Pedro Henrique Silva;10/07/1988;185;3;;1
GESTÃO TRIBUTÁRIA;850002743;Ana Beatriz Costa;25/12/1991;183;4;;
GESTÃO TRIBUTÁRIA;850002744;Lucas Gabriel Oliveira;08/05/1987;181;5;2;
GESTÃO TRIBUTÁRIA;850002745;Isabela Rodrigues;18/09/1992;179;6;;2
GESTÃO TRIBUTÁRIA;850002746;Rafael Santos Lima;03/02/1989;177;7;;
GESTÃO TRIBUTÁRIA;850002747;Larissa Pereira;20/06/1990;175;8;3;
GESTÃO TRIBUTÁRIA;850002748;Gustavo Almeida;12/11/1986;173;9;;3
GESTÃO TRIBUTÁRIA;850002749;Natália Fernandes;27/04/1993;171;10;;
GESTÃO TRIBUTÁRIA;850002750;Diego Martins;14/08/1988;169;11;4;
GESTÃO TRIBUTÁRIA;850002751;Bruna Carvalho;01/01/1991;167;12;;4
GESTÃO TRIBUTÁRIA;850002752;Mateus Souza;16/10/1987;165;13;;
GESTÃO TRIBUTÁRIA;850002753;Letícia Barbosa;23/03/1992;163;14;5;
GESTÃO TRIBUTÁRIA;850002754;Vinicius Rocha;09/07/1989;161;15;;5
GESTÃO TRIBUTÁRIA;850002755;Amanda Silva;26/12/1990;159;16;;
GESTÃO TRIBUTÁRIA;850002756;Rodrigo Costa;13/05/1985;157;17;6;
GESTÃO TRIBUTÁRIA;850002757;Priscila Dias;30/08/1993;155;18;;6
GESTÃO TRIBUTÁRIA;850002758;Leandro Moreira;07/02/1988;153;19;;
GESTÃO TRIBUTÁRIA;850002759;Tatiane Nascimento;24/06/1991;151;20;7;
TECNOLOGIA DA INFORMAÇÃO;850000526;Rykchard Navarro Lorca;08/09/2002;173;1;1;
TECNOLOGIA DA INFORMAÇÃO;850000527;Carlos Eduardo Tech;15/03/1995;171;2;;
TECNOLOGIA DA INFORMAÇÃO;850000528;Marina Santos Dev;22/07/1990;169;3;;1
TECNOLOGIA DA INFORMAÇÃO;850000529;Felipe Oliveira Code;10/12/1988;167;4;;
TECNOLOGIA DA INFORMAÇÃO;850000530;Ana Julia Systems;05/06/1992;165;5;2;
TECNOLOGIA DA INFORMAÇÃO;850000531;Roberto Tech Silva;18/09/1987;163;6;;2
TECNOLOGIA DA INFORMAÇÃO;850000532;Juliana Dev Costa;25/01/1991;161;7;;
TECNOLOGIA DA INFORMAÇÃO;850000533;Marcos Code Lima;30/04/1989;159;8;3;
TECNOLOGIA DA INFORMAÇÃO;850000534;Patricia Systems;12/11/1986;157;9;;3
TECNOLOGIA DA INFORMAÇÃO;850000535;Ricardo Dev Santos;08/08/1993;155;10;;
TECNOLOGIA DA INFORMAÇÃO;850000536;Luciana Tech Alves;14/02/1984;153;11;4;
TECNOLOGIA DA INFORMAÇÃO;850000537;Anderson Code Dias;27/05/1990;151;12;;4
TECNOLOGIA DA INFORMAÇÃO;850000538;Camila Systems Rocha;03/10/1988;149;13;;
TECNOLOGIA DA INFORMAÇÃO;850000539;Felipe Dev Moreira;21/07/1991;147;14;5;
TECNOLOGIA DA INFORMAÇÃO;850000540;Gabriela Tech Souza;16/12/1987;145;15;;5
TECNOLOGIA DA INFORMAÇÃO;850000541;Thiago Code Martins;09/03/1992;143;16;;
TECNOLOGIA DA INFORMAÇÃO;850000542;Renata Systems Silva;24/06/1989;141;17;6;
TECNOLOGIA DA INFORMAÇÃO;850000543;Bruno Dev Carvalho;11/01/1990;139;18;;6
TECNOLOGIA DA INFORMAÇÃO;850000544;Vanessa Tech Lima;28/08/1985;137;19;;
TECNOLOGIA DA INFORMAÇÃO;850000545;Leonardo Code Santos;06/04/1993;135;20;7;`;

      const lines = mockData.trim().split('\n');
      const headers = lines[0].split(';');
      
      this.candidates = lines.slice(1).map(line => {
        const values = line.split(';');
        return {
          especialidade: values[0],
          inscricao: values[1],
          nome: values[2],
          nascimento: values[3],
          nota: parseInt(values[4]),
          ac: parseInt(values[5]),
          pcd: values[6] ? parseInt(values[6]) : null,
          ni: values[7] ? parseInt(values[7]) : null,
          formacao: values[8] || undefined,
          experiencia: values[9] || undefined,
          aprovacoes: values[10] || undefined,
          removed: false
        };
      });

      return this.candidates;
    } catch (error) {
      console.error('Error loading CSV data:', error);
      throw new Error('Failed to load candidate data');
    }
  }
}