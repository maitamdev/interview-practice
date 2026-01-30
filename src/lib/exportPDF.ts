import { jsPDF } from 'jspdf';
import { InterviewSession, InterviewAnswer, SessionSummary, ROLE_INFO, LEVEL_INFO } from '@/types/interview';

interface ExportData {
  session: InterviewSession;
  answers: InterviewAnswer[];
  summary: SessionSummary | null;
}

export async function exportInterviewToPDF(data: ExportData): Promise<void> {
  const { session, answers, summary } = data;
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, maxWidth: number, fontSize: number = 12) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    y += lines.length * (fontSize * 0.4) + 5;
  };

  // Helper to check page break
  const checkPageBreak = (neededSpace: number = 30) => {
    if (y > doc.internal.pageSize.getHeight() - neededSpace) {
      doc.addPage();
      y = 20;
    }
  };

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(0, 128, 128); // Primary color
  doc.text('Báo cáo Phỏng vấn', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  const roleLabel = ROLE_INFO[session.role]?.labelVi || session.role;
  const levelLabel = LEVEL_INFO[session.level]?.labelVi || session.level;
  doc.text(`${roleLabel} • ${levelLabel}`, pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Date
  doc.setFontSize(10);
  const date = session.ended_at ? new Date(session.ended_at).toLocaleDateString('vi-VN') : 'N/A';
  doc.text(`Ngày: ${date}`, pageWidth / 2, y, { align: 'center' });
  y += 20;

  // Overall Score
  doc.setDrawColor(0, 128, 128);
  doc.setFillColor(240, 255, 255);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 30, 5, 5, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(0, 128, 128);
  const overallScore = summary?.overall_score || 
    (answers.length > 0 ? answers.reduce((sum, a) => sum + (a.scores?.overall || 0), 0) / answers.length : 0);
  doc.text(`Điểm tổng thể: ${overallScore.toFixed(1)}/5`, pageWidth / 2, y + 18, { align: 'center' });
  y += 45;

  // Strengths & Weaknesses
  if (summary) {
    checkPageBreak(60);
    
    // Strengths
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 150, 0);
    doc.text('✓ Điểm mạnh', margin, y);
    y += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    (summary.strengths || []).forEach(strength => {
      checkPageBreak();
      addText(`• ${strength}`, margin + 5, pageWidth - margin * 2 - 10, 11);
    });
    y += 5;

    checkPageBreak(60);
    
    // Weaknesses
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(200, 100, 0);
    doc.text('⚠ Cần cải thiện', margin, y);
    y += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    (summary.weaknesses || []).forEach(weakness => {
      checkPageBreak();
      addText(`• ${weakness}`, margin + 5, pageWidth - margin * 2 - 10, 11);
    });
    y += 10;
  }

  // Skill Breakdown
  if (summary?.skill_breakdown && Object.keys(summary.skill_breakdown).length > 0) {
    checkPageBreak(80);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Phân tích kỹ năng', margin, y);
    y += 10;

    const skillLabels: Record<string, string> = {
      communication: 'Giao tiếp',
      relevance: 'Độ liên quan',
      structure: 'Cấu trúc',
      depth: 'Chiều sâu',
      clarity: 'Rõ ràng',
    };

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    Object.entries(summary.skill_breakdown).forEach(([skill, score]) => {
      checkPageBreak();
      const label = skillLabels[skill] || skill;
      const barWidth = 100;
      const barHeight = 8;
      const fillWidth = (Number(score) / 5) * barWidth;
      
      doc.setTextColor(60, 60, 60);
      doc.text(`${label}:`, margin, y);
      
      // Background bar
      doc.setFillColor(230, 230, 230);
      doc.roundedRect(margin + 50, y - 6, barWidth, barHeight, 2, 2, 'F');
      
      // Fill bar
      doc.setFillColor(0, 128, 128);
      doc.roundedRect(margin + 50, y - 6, fillWidth, barHeight, 2, 2, 'F');
      
      // Score text
      doc.text(`${Number(score).toFixed(1)}`, margin + 155, y);
      y += 12;
    });
    y += 5;
  }

  // Detailed Answers
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Chi tiết câu hỏi', margin, y);
  y += 10;

  answers.forEach((answer, index) => {
    checkPageBreak(50);
    
    // Question header
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 128, 128);
    doc.text(`Câu ${index + 1} - Điểm: ${answer.scores?.overall?.toFixed(1) || 'N/A'}/5`, margin + 3, y + 6);
    y += 12;

    // Question
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text('Câu hỏi:', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    addText(answer.question_text || 'N/A', margin, pageWidth - margin * 2, 10);

    // Answer
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.text('Câu trả lời:', margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    addText(answer.answer_text || 'Không trả lời', margin, pageWidth - margin * 2, 10);

    // Feedback
    if (answer.feedback?.summary) {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 100, 150);
      doc.text('Nhận xét:', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      addText(answer.feedback.summary, margin, pageWidth - margin * 2, 10);
    }

    y += 10;
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `AI Interview Coach - Trang ${i}/${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  const fileName = `interview-report-${session.role}-${date.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}
