export function exportToWord(script, title = '방송대본') {
  const tableRows = [];

  // Add header row
  tableRows.push(`
    <tr style="background-color: #4F46E5; color: white;">
      <th style="border: 1px solid #312E81; padding: 8px; text-align: center;">씬</th>
      <th style="border: 1px solid #312E81; padding: 8px; text-align: center;">컷</th>
      <th style="border: 1px solid #312E81; padding: 8px; text-align: center;">샷 타입</th>
      <th style="border: 1px solid #312E81; padding: 8px; text-align: center;">시간</th>
      <th style="border: 1px solid #312E81; padding: 8px; text-align: center;">오디오</th>
      <th style="border: 1px solid #312E81; padding: 8px; text-align: center;">영상 프롬프트</th>
      <th style="border: 1px solid #312E81; padding: 8px; text-align: center;">한글 해석</th>
    </tr>
  `);

  // Add data rows
  script.scenes.forEach(scene => {
    scene.cuts.forEach((cut, cutIndex) => {
      const isFirstCut = cutIndex === 0;
      tableRows.push(`
        <tr>
          ${isFirstCut ? `<td style="border: 1px solid #E5E7EB; padding: 8px; text-align: center; vertical-align: top; background-color: #EEF2FF;" rowspan="${scene.cuts.length}"><strong>씬 ${scene.sceneNumber}</strong><br/><span style="font-size: 10px; color: #6366F1;">${scene.sceneTitle || ''}</span></td>` : ''}
          <td style="border: 1px solid #E5E7EB; padding: 8px; text-align: center;">${cut.cutNumber}</td>
          <td style="border: 1px solid #E5E7EB; padding: 8px; text-align: center;">${cut.shotType}</td>
          <td style="border: 1px solid #E5E7EB; padding: 8px; text-align: center;">${cut.duration || '-'}초</td>
          <td style="border: 1px solid #E5E7EB; padding: 8px;">${escapeHtml(cut.audio)}</td>
          <td style="border: 1px solid #E5E7EB; padding: 8px; font-size: 11px; color: #374151;">${escapeHtml(cut.prompt)}</td>
          <td style="border: 1px solid #E5E7EB; padding: 8px; font-size: 11px; color: #6B7280;">${escapeHtml(cut.promptKr)}</td>
        </tr>
      `);
    });
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(script.title || title)}</title>
      <style>
        body { font-family: 'Malgun Gothic', sans-serif; margin: 40px; }
        h1 { color: #312E81; border-bottom: 2px solid #4F46E5; padding-bottom: 10px; }
        .meta { color: #6B7280; margin-bottom: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
      </style>
    </head>
    <body>
      <h1>${escapeHtml(script.title || title)}</h1>
      <div class="meta">
        <p>총 러닝타임: ${script.totalDuration || '-'}초</p>
        <p>생성일: ${new Date().toLocaleDateString('ko-KR')}</p>
      </div>
      <table>
        ${tableRows.join('')}
      </table>
    </body>
    </html>
  `;

  // Create blob and download
  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${script.title || title}_${new Date().toISOString().split('T')[0]}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
