import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Candidate, CallPosition, Specialty } from '../types';
import { format } from 'date-fns';

export class ExportService {
  async exportToExcel(
    specialty: Specialty,
    candidates: Candidate[],
    callOrder?: CallPosition[]
  ): Promise<void> {
    try {
      const workbook = XLSX.utils.book_new();

      // Candidates sheet (only if there are candidates to export)
      if (candidates && candidates.length > 0) {
        const candidatesData = candidates.map(candidate => ({
          'Inscrição': candidate.inscricao,
          'Nome': candidate.nome,
          'Data de Nascimento': candidate.nascimento,
          'Nota': candidate.nota,
          'Classificação AC': candidate.ac,
          'Classificação PCD': candidate.pcd || '',
          'Classificação NI': candidate.ni || '',
          'Status': candidate.removed ? 'Removido' : 'Ativo'
        }));

        const candidatesSheet = XLSX.utils.json_to_sheet(candidatesData);
        XLSX.utils.book_append_sheet(workbook, candidatesSheet, 'Candidatos');
      }

      // Call order sheet if provided
      if (callOrder && callOrder.length > 0) {
        const callOrderData = callOrder.map(position => ({
          'Posição': position.position,
          'Tipo': position.type,
          'Inscrição': position.candidate?.inscricao || '',
          'Nome': position.candidate?.nome || '',
          'Nota': position.candidate?.nota || ''
        }));

        const callOrderSheet = XLSX.utils.json_to_sheet(callOrderData);
        XLSX.utils.book_append_sheet(workbook, callOrderSheet, 'Ordem de Chamada');
      }

      // Generate filename
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const filename = `${specialty.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error('Failed to export to Excel');
    }
  }

  async exportToPDF(
    specialty: Specialty,
    elementId: string,
    options?: { title?: string; subtitle?: string; removedCandidates?: Candidate[] }
  ): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error('Element not found for PDF export');
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        ignoreElements: (el: Element) => {
          try {
            return (el as HTMLElement).classList?.contains('export-hide-pdf') || false;
          } catch {
            return false;
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Margens e cabeçalho
      const margin = 12; // mm
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * contentWidth) / canvas.width;

      const appTitle = 'Aprovados - Auditor Fiscal Tributário - Cuiabá';
      const editalText = 'Concurso Edital nº 01/2024';
      const editalUrl = (import.meta as any).env?.VITE_EDITAL_URL as string | undefined;
      const specialtyLabel = `Especialidade: ${String(specialty)}`;
      const timestampText = `Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')}`;

      const drawHeader = () => {
        let yCursor = margin + 4;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(16);
        pdf.text(appTitle, margin, yCursor);
        yCursor += 7;

        if (options?.title) {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(13);
          pdf.text(String(options.title), margin, yCursor);
          yCursor += 6;
        }

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        const fullEdital = editalUrl ? `${editalText} (${editalUrl})` : editalText;
        pdf.text(fullEdital, margin, yCursor);
        yCursor += 6;

        if (options?.subtitle) {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.text(String(options.subtitle), margin, yCursor);
          yCursor += 5;
        }

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.text(specialtyLabel, margin, yCursor);
        yCursor += 6;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.text(timestampText, margin, yCursor);
        yCursor += 6;

        return yCursor; // retorna a linha onde começa o conteúdo
      };

      // Primeira página (tabela principal)
      const contentStartY = drawHeader();
      let heightLeft = imgHeight;
      pdf.addImage(imgData, 'PNG', margin, contentStartY, contentWidth, imgHeight);
      heightLeft -= (pageHeight - contentStartY - margin);

      // Demais páginas
      while (heightLeft > 0) {
        pdf.addPage();
        const nextContentStartY = drawHeader();
        const usableHeight = pageHeight - nextContentStartY - margin;
        const shift = imgHeight - heightLeft;
        const position = nextContentStartY - shift;
        pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
        heightLeft -= usableHeight;
      }

      // Se houver removidos, renderiza uma seção após a tabela
      if (options?.removedCandidates && options.removedCandidates.length > 0) {
        pdf.addPage();
        let y = drawHeader();
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('Candidatos que não assumem', margin, y);
        y += 6;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        options.removedCandidates.forEach((c, idx) => {
          const line = `${idx + 1}. ${c.inscricao} - ${c.nome} | Nota: ${c.nota} | AC: ${c.ac}${c.pcd ? ` | PCD: ${c.pcd}` : ''}${c.ni ? ` | NI: ${c.ni}` : ''}`;
          if (y > pageHeight - margin) {
            pdf.addPage();
            y = drawHeader();
          }
          pdf.text(line, margin, y);
          y += 5;
        });
      }

      // Generate filename
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const filename = `${specialty.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`;

      pdf.save(filename);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw new Error('Failed to export to PDF');
    }
  }

  async exportProfilesToPDF(
    specialty: Specialty,
    calledCandidates: any[],
    profilesData: any
  ): Promise<void> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Configurar encoding para evitar problemas com caracteres especiais
      pdf.setLanguage('pt-BR');
      
      // Configurações da página
      const margin = 15;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margin * 2;
      
      // Cabeçalho específico para perfis
      const appTitle = 'Perfil dos Candidatos';
      const editalText = 'Concurso Auditor Fiscal Tributário - Cuiabá';
      const specialtyLabel = `Especialidade: ${specialty}`;
      const candidateCountText = `Total de candidatos: ${calledCandidates.length}`;
      const timestampText = `Gerado em ${format(new Date(), 'dd/MM/yyyy HH:mm')}`;

      const drawProfileHeader = () => {
        let yCursor = margin;
        
        // Fundo cinza para o cabeçalho
        const headerHeight = 35;
        pdf.setFillColor(240, 240, 240); // Cinza claro
        pdf.rect(0, 0, pageWidth, headerHeight, 'F');
        
        // Linha separadora inferior
        pdf.setDrawColor(180, 180, 180); // Cinza médio
        pdf.setLineWidth(0.5);
        pdf.line(0, headerHeight, pageWidth, headerHeight);
        
        yCursor = margin;
        
        // Título principal
        pdf.setTextColor(50, 50, 50); // Cinza escuro
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(18);
        pdf.text(appTitle, margin, yCursor + 8);
        
        // Subtítulo do edital
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);
        pdf.text(editalText, margin, yCursor + 16);

        // Linha com especialidade, quantidade e timestamp
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        const infoLine = `${specialtyLabel} | ${candidateCountText} | ${timestampText}`;
        pdf.text(infoLine, margin, yCursor + 25);

        // Reset cor do texto para preto
        pdf.setTextColor(0, 0, 0);
        
        return headerHeight + 10; // Retorna posição após header + espaço
      };

      let currentY = drawProfileHeader();
      let candidateIndex = 0;

      // Função para calcular idade
      const calculateAge = (birthDate: string): number => {
        const [day, month, year] = birthDate.split('/').map(Number);
        const birth = new Date(year, month - 1, day);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
        
        return age;
      };

      // Função para processar cada candidato
      for (const candidate of calledCandidates) {
        candidateIndex++;
        const profile = profilesData.getProfile ? profilesData.getProfile(candidate.nome) : null;
        const experienciaDetails = profile && profilesData.getExperienciaDetails ? 
          profilesData.getExperienciaDetails(profile.experiencia_profissional) : null;
        const age = calculateAge(candidate.nascimento);

        // Calcular altura dinâmica baseada no conteúdo
        let estimatedHeight = 60; // altura base
        
        // Adicionar altura baseada no conteúdo
        if (profile) {
          if (profile.formacao && profilesData.formatFormacao) {
            const formacaoLines = profilesData.formatFormacao(profile.formacao).split('\n').length;
            estimatedHeight += Math.max(formacaoLines * 3, 10);
          }
          
          if (profile.aprovacoes && profilesData.formatAprovacoes) {
            const aprovacaoLines = profilesData.formatAprovacoes(profile.aprovacoes).split('\n').length;
            estimatedHeight += Math.max(aprovacaoLines * 3, 10);
          }
          
          if (experienciaDetails?.activities?.length > 0) {
            estimatedHeight += Math.min(experienciaDetails.activities.length * 2.5, 15);
          }
          
          if (experienciaDetails?.expertise?.length > 0) {
            estimatedHeight += Math.min(experienciaDetails.expertise.length * 2.5, 12);
          }
        }
        
        estimatedHeight = Math.max(estimatedHeight, 70); // altura mínima
        estimatedHeight = Math.min(estimatedHeight, 140); // altura máxima
        
        // Verificar se precisa de nova página
        if (currentY + estimatedHeight > pageHeight - margin - 10) {
          pdf.addPage();
          currentY = drawProfileHeader();
        }

        // Início da caixa do candidato
        const boxStartY = currentY;
        let boxEndY = currentY; // Será calculado dinamicamente
        
        currentY += 8; // Margem interna da caixa

        // Cabeçalho do candidato com fundo azul
        const nameBoxHeight = 12;
        pdf.setFillColor(59, 130, 246); // Azul
        pdf.rect(margin + 3, currentY - 2, contentWidth - 6, nameBoxHeight, 'F');
        
        // Nome do candidato em branco
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text(`${candidateIndex}. ${candidate.nome}`, margin + 6, currentY + 6);
        currentY += nameBoxHeight + 3;

        // Informações básicas (cor preta novamente)
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text(`Inscrição: ${candidate.inscricao} | Nota: ${candidate.nota}`, margin + 6, currentY);
        currentY += 8;

        // Organizar em duas colunas com margens internas
        const col1X = margin + 6;
        const col2X = margin + 6 + contentWidth / 2;
        let col1Y = currentY;
        let col2Y = currentY;

        // Coluna 1: Data de nascimento e Formação
        // Seção Data de Nascimento
        pdf.setTextColor(59, 130, 246); // Azul para títulos
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.text('* DATA DE NASCIMENTO', col1X, col1Y);
        col1Y += 4;
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text(`${candidate.nascimento} (${age} anos)`, col1X + 2, col1Y);
        col1Y += 8;

        // Seção Formação
        pdf.setTextColor(59, 130, 246);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.text('* FORMACAO', col1X, col1Y);
        col1Y += 4;
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        
        if (profile && profilesData.formatFormacao) {
          const formacao = profilesData.formatFormacao(profile.formacao).split('\n');
          formacao.forEach(linha => {
            if (linha.trim()) {
              const lines = pdf.splitTextToSize(linha, contentWidth / 2 - 15);
              lines.forEach((line: string) => {
                pdf.text(line, col1X + 2, col1Y);
                col1Y += 3.5;
              });
            }
          });
        } else {
          pdf.text('Nao informado', col1X + 2, col1Y);
          col1Y += 3.5;
        }

        // Coluna 2: Aprovações
        pdf.setTextColor(34, 197, 94); // Verde para aprovações
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.text('* APROVACOES', col2X, col2Y);
        col2Y += 4;
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        
        if (profile && profilesData.formatAprovacoes) {
          const aprovacoes = profilesData.formatAprovacoes(profile.aprovacoes).split('\n');
          aprovacoes.forEach(linha => {
            if (linha.trim()) {
              const lines = pdf.splitTextToSize(linha, contentWidth / 2 - 15);
              lines.forEach((line: string) => {
                pdf.text(line, col2X + 2, col2Y);
                col2Y += 3.5;
              });
            }
          });
        } else {
          pdf.text('Nao informado', col2X + 2, col2Y);
          col2Y += 3.5;
        }

        // Experiência em largura total
        currentY = Math.max(col1Y, col2Y) + 3;
        
        // Linha separadora antes da experiência
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.2);
        pdf.line(margin + 6, currentY, margin + contentWidth - 6, currentY);
        currentY += 4;
        
        // Título da Experiência
        pdf.setTextColor(168, 85, 247); // Roxo para experiência
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.text('* EXPERIENCIA PROFISSIONAL', margin + 6, currentY);
        currentY += 4;
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);

        if (profile && profilesData.formatExperiencia) {
          const experiencia = profilesData.formatExperiencia(profile.experiencia_profissional);
          const expLines = pdf.splitTextToSize(experiencia, contentWidth - 12);
          expLines.forEach((line: string) => {
            pdf.text(line, margin + 8, currentY);
            currentY += 3;
          });

          // Atividades com ícone
          if (experienciaDetails?.activities?.length > 0) {
            currentY += 2;
            pdf.setTextColor(100, 100, 100);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(7);
            pdf.text('- Principais atividades:', margin + 8, currentY);
            currentY += 3;
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'normal');
            
            experienciaDetails.activities.forEach((atividade: string) => { // Mostrar todas
              const lines = pdf.splitTextToSize(`  • ${atividade}`, contentWidth - 20);
              lines.forEach((line: string) => {
                pdf.text(line, margin + 10, currentY);
                currentY += 3;
              });
            });
          }

          // Expertise com ícone
          if (experienciaDetails?.expertise?.length > 0) {
            currentY += 2;
            pdf.setTextColor(100, 100, 100);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(7);
            pdf.text('- Expertise tecnica:', margin + 8, currentY);
            currentY += 3;
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'normal');
            
            experienciaDetails.expertise.forEach((exp: string) => { // Mostrar todas
              const lines = pdf.splitTextToSize(`  • ${exp}`, contentWidth - 20);
              lines.forEach((line: string) => {
                pdf.text(line, margin + 10, currentY);
                currentY += 3;
              });
            });
          }

          // Sistemas
          if (experienciaDetails?.systems?.length > 0) {
            currentY += 2;
            pdf.setTextColor(100, 100, 100);
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(7);
            pdf.text('- Sistemas/Tecnologias:', margin + 8, currentY);
            currentY += 3;
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', 'normal');
            
            const sistemas = experienciaDetails.systems.join(', ');
            const sistLines = pdf.splitTextToSize(`  ${sistemas}`, contentWidth - 20);
            sistLines.forEach((line: string) => {
              pdf.text(line, margin + 10, currentY);
              currentY += 3;
            });
          }
        } else {
          pdf.text('Nao informado', margin + 8, currentY);
          currentY += 3;
        }

        // Desenhar a caixa agora que sabemos a altura real
        boxEndY = currentY + 5;
        const finalBoxHeight = boxEndY - boxStartY;
        
        // Fundo da caixa (cinza muito claro)
        pdf.setFillColor(252, 252, 252);
        pdf.rect(margin, boxStartY, contentWidth, finalBoxHeight, 'F');
        
        // Borda da caixa
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(0.3);
        pdf.rect(margin, boxStartY, contentWidth, finalBoxHeight, 'S');

        currentY += 15; // Espaço maior entre candidatos
      }

      // Gerar nome do arquivo
      const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
      const filename = `Perfis_${specialty.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`;

      pdf.save(filename);
    } catch (error) {
      console.error('Error exporting profiles to PDF:', error);
      throw new Error('Falha ao exportar perfis para PDF');
    }
  }
}