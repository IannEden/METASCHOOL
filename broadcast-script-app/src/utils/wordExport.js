export function exportToWord(script, generatedImages = {}) {
  const tableRows = [];

  // Add header row
  tableRows.push(`
    <tr style="background-color: #4F46E5; color: white;">
      <th style="border: 1px solid #312E81; padding: 12px; text-align: center; width: 60px;">씬</th>
      <th style="border: 1px solid #312E81; padding: 12px; text-align: center; width: 40px;">컷</th>
      <th style="border: 1px solid #312E81; padding: 12px; text-align: center; width: 80px;">샷</th>
      <th style="border: 1px solid #312E81; padding: 12px; text-align: center; width: 40px;">시간</th>
      <th style="border: 1px solid #312E81; padding: 12px; text-align: center;">오디오 (나레이션)</th>
      <th style="border: 1px solid #312E81; padding: 12px; text-align: center;">영상 프롬프트</th>
    </tr>
  `);

  // Add data rows
  script.scenes?.forEach(scene => {
    scene.cuts?.forEach((cut, cutIndex) => {
      const isFirstCut = cutIndex === 0;
      const imageKey = `${scene.sceneNumber}-${cut.cutNumber}`;
      const imageUrl = generatedImages[imageKey];

      tableRows.push(`
        <tr>
          ${isFirstCut ? `
            <td style="border: 1px solid #D1D5DB; padding: 12px; text-align: center; vertical-align: middle; background-color: #EEF2FF;" rowspan="${scene.cuts.length}">
              <strong style="font-size: 14px;">씬 ${scene.sceneNumber}</strong><br/>
              <span style="font-size: 11px; color: #6366F1;">${escapeHtml(scene.sceneTitle || '')}</span>
            </td>
          ` : ''}
          <td style="border: 1px solid #D1D5DB; padding: 12px; text-align: center; vertical-align: middle; font-weight: bold;">${cut.cutNumber}</td>
          <td style="border: 1px solid #D1D5DB; padding: 12px; text-align: center; vertical-align: middle; font-size: 11px;">${escapeHtml(cut.shotType)}</td>
          <td style="border: 1px solid #D1D5DB; padding: 12px; text-align: center; vertical-align: middle;">${cut.duration || '-'}초</td>
          <td style="border: 1px solid #D1D5DB; padding: 12px; vertical-align: top; line-height: 1.6;">
            ${escapeHtml(cut.audio)}
          </td>
          <td style="border: 1px solid #D1D5DB; padding: 12px; vertical-align: top;">
            <div style="font-size: 10px; color: #374151; line-height: 1.5; font-family: monospace; white-space: pre-wrap;">${escapeHtml(cut.prompt)}</div>
            ${cut.promptKr ? `<div style="font-size: 10px; color: #6B7280; margin-top: 8px; padding-top: 8px; border-top: 1px solid #E5E7EB;">${escapeHtml(cut.promptKr)}</div>` : ''}
          </td>
        </tr>
      `);
    });
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(script.title || '방송대본')}</title>
    </head>
    <body style="font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; margin: 30px; font-size: 12px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #312E81; margin-bottom: 10px; font-size: 24px;">${escapeHtml(script.title || '방송대본')}</h1>
        <p style="color: #6B7280; margin: 5px 0;">총 러닝타임: ${script.totalDuration || '-'}초 | 생성일: ${new Date().toLocaleDateString('ko-KR')}</p>
      </div>
      <table style="border-collapse: collapse; width: 100%;">
        ${tableRows.join('')}
      </table>
    </body>
    </html>
  `;

  downloadFile(html, `${script.title || '방송대본'}_${formatDate()}.doc`, 'application/msword');
}

export function exportToPDF(script, generatedImages = {}) {
  // Create a printable HTML and use browser's print to PDF
  const printContent = generatePDFContent(script, generatedImages);

  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write(printContent);
  printWindow.document.close();

  // Wait for images to load then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
}

function generatePDFContent(script, generatedImages) {
  let content = '';

  script.scenes?.forEach(scene => {
    content += `
      <div class="scene">
        <div class="scene-header">씬 ${scene.sceneNumber}: ${escapeHtml(scene.sceneTitle || '')}</div>
        <div class="cuts">
    `;

    scene.cuts?.forEach(cut => {
      const imageKey = `${scene.sceneNumber}-${cut.cutNumber}`;
      const imageUrl = generatedImages[imageKey];

      content += `
        <div class="cut">
          <div class="cut-header">
            <span class="cut-number">${cut.cutNumber}</span>
            <span class="shot-type">${escapeHtml(cut.shotType)}</span>
            <span class="duration">${cut.duration || '-'}초</span>
          </div>
          <div class="cut-content">
            <div class="left-content">
              <div class="audio-section">
                <div class="section-title">나레이션</div>
                <div class="audio-text">${escapeHtml(cut.audio)}</div>
              </div>
              <div class="prompt-section">
                <div class="section-title">영상 프롬프트</div>
                <div class="prompt-text">${escapeHtml(cut.prompt)}</div>
                ${cut.promptKr ? `<div class="prompt-kr">${escapeHtml(cut.promptKr)}</div>` : ''}
              </div>
            </div>
            ${imageUrl ? `
              <div class="right-content">
                <img src="${imageUrl}" alt="씬 ${scene.sceneNumber} 컷 ${cut.cutNumber}" />
              </div>
            ` : ''}
          </div>
        </div>
      `;
    });

    content += '</div></div>';
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(script.title || '방송대본')}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        * { box-sizing: border-box; }
        body {
          font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif;
          margin: 0;
          padding: 20px;
          font-size: 11px;
          line-height: 1.5;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #4F46E5;
        }
        .header h1 {
          color: #312E81;
          font-size: 24px;
          margin: 0 0 10px 0;
        }
        .header .meta {
          color: #6B7280;
          font-size: 12px;
        }
        .scene {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        .scene-header {
          background: linear-gradient(135deg, #4F46E5, #6366F1);
          color: white;
          padding: 12px 16px;
          font-weight: bold;
          font-size: 14px;
          border-radius: 8px 8px 0 0;
        }
        .cuts {
          border: 1px solid #E5E7EB;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }
        .cut {
          padding: 15px;
          border-bottom: 1px solid #E5E7EB;
        }
        .cut:last-child {
          border-bottom: none;
        }
        .cut-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .cut-number {
          width: 28px;
          height: 28px;
          background: #4F46E5;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 12px;
        }
        .shot-type {
          background: #EEF2FF;
          color: #4F46E5;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 500;
        }
        .duration {
          color: #9CA3AF;
          font-size: 11px;
        }
        .cut-content {
          display: flex;
          gap: 15px;
        }
        .left-content {
          flex: 1;
        }
        .right-content {
          width: 200px;
          flex-shrink: 0;
        }
        .right-content img {
          width: 100%;
          border-radius: 8px;
          border: 1px solid #E5E7EB;
        }
        .section-title {
          font-size: 10px;
          font-weight: bold;
          color: #6B7280;
          margin-bottom: 6px;
          text-transform: uppercase;
        }
        .audio-section {
          background: #EFF6FF;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 10px;
        }
        .audio-text {
          color: #1E40AF;
          font-size: 12px;
          line-height: 1.7;
        }
        .prompt-section {
          background: #F9FAFB;
          padding: 12px;
          border-radius: 8px;
        }
        .prompt-text {
          font-family: monospace;
          font-size: 9px;
          color: #374151;
          line-height: 1.5;
          word-break: break-word;
        }
        .prompt-kr {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #E5E7EB;
          font-size: 9px;
          color: #6B7280;
        }
        @media print {
          body { padding: 0; }
          .scene { page-break-inside: avoid; }
          .cut { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${escapeHtml(script.title || '방송대본')}</h1>
        <div class="meta">
          총 러닝타임: ${script.totalDuration || '-'}초 |
          씬: ${script.scenes?.length || 0}개 |
          생성일: ${new Date().toLocaleDateString('ko-KR')}
        </div>
      </div>
      ${content}
    </body>
    </html>
  `;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate() {
  return new Date().toISOString().split('T')[0];
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob(['\ufeff', content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}
