/**
 * Export interview report to PDF
 */

interface ReportData {
  role: string;
  level: string;
  date: string;
  overallScore: number;
  totalQuestions: number;
  strengths: string[];
  weaknesses: string[];
  answers: {
    question: string;
    answer: string;
    score: number;
    feedback: string;
  }[];
}

export async function exportToPDF(data: ReportData): Promise<void> {
  // Create printable HTML
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Báo cáo phỏng vấn - ${data.role}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
        .header h1 { color: #3b82f6; font-size: 24px; }
        .header p { color: #666; margin-top: 8px; }
        .score-box { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; }
        .score-box .score { font-size: 48px; font-weight: bold; }
        .score-box .label { font-size: 14px; opacity: 0.9; }
        .section { margin: 25px 0; }
        .section h2 { color: #3b82f6; font-size: 18px; margin-bottom: 12px; border-left: 4px solid #3b82f6; padding-left: 12px; }
        .list { list-style: none; }
        .list li { padding: 8px 0; padding-left: 20px; position: relative; }
        .list li::before { content: "✓"; position: absolute; left: 0; color: #22c55e; }
        .list.weak li::before { content: "!"; color: #f59e0b; }
        .qa-item { background: #f8fafc; padding: 16px; border-radius: 8px; margin: 12px 0; border-left: 4px solid #3b82f6; }
        .qa-item .question { font-weight: 600; color: #1e40af; }
        .qa-item .answer { margin: 10px 0; color: #475569; }
        .qa-item .meta { display: flex; justify-content: space-between; font-size: 12px; color: #64748b; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎯 Báo cáo Phỏng vấn</h1>
        <p>${data.role} • ${data.level} • ${data.date}</p>
      </div>
      
      <div class="score-box">
        <div class="score">${data.overallScore.toFixed(1)}/5</div>
        <div class="label">Điểm tổng thể • ${data.totalQuestions} câu hỏi</div>
      </div>
      
      <div class="section">
        <h2>💪 Điểm mạnh</h2>
        <ul class="list">
          ${data.strengths.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
      
      <div class="section">
        <h2>📈 Cần cải thiện</h2>
        <ul class="list weak">
          ${data.weaknesses.map(w => `<li>${w}</li>`).join('')}
        </ul>
      </div>
      
      <div class="section">
        <h2>📝 Chi tiết câu hỏi</h2>
        ${data.answers.map((a, i) => `
          <div class="qa-item">
            <div class="question">Câu ${i + 1}: ${a.question}</div>
            <div class="answer">${a.answer}</div>
            <div class="meta">
              <span>Điểm: ${a.score}/5</span>
              <span>${a.feedback}</span>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="footer">
        <p>Được tạo bởi AI Interview Coach • ${new Date().toLocaleDateString('vi-VN')}</p>
      </div>
    </body>
    </html>
  `;

  // Open print dialog
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
