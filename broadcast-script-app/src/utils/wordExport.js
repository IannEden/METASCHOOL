export function exportToWord(script, generatedImages = {}) {
  const content = generateDocumentContent(script, generatedImages, 'word');
  downloadFile(content, `${script.title || '방송대본'}_${formatDate()}.doc`, 'application/msword');
}

export function exportToPDF(script, generatedImages = {}) {
  const printContent = generateDocumentContent(script, generatedImages, 'pdf');

  const printWindow = window.open('', '_blank', 'width=900,height=700');
  printWindow.document.write(printContent);
  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
}

function generateDocumentContent(script, generatedImages, format) {
  const totalCuts = script.scenes?.reduce((acc, scene) => acc + (scene.cuts?.length || 0), 0) || 0;

  let scenesHtml = '';

  script.scenes?.forEach(scene => {
    let cutsHtml = '';

    scene.cuts?.forEach(cut => {
      const imageKey = `${scene.sceneNumber}-${cut.cutNumber}`;
      const imageUrl = generatedImages[imageKey];

      cutsHtml += `
        <div class="cut">
          <div class="cut-header">
            <span class="cut-number">${cut.cutNumber}</span>
            <span class="shot-type">${escapeHtml(cut.shotType)}</span>
            <span class="duration">${cut.duration || '-'}초</span>
          </div>

          <div class="cut-body">
            <div class="left-content">
              <!-- 나레이션 -->
              <div class="section audio-section">
                <div class="section-label">나레이션 (${cut.duration}초)</div>
                <div class="section-content">${escapeHtml(cut.audio)}</div>
              </div>

              <!-- 이미지 프롬프트 -->
              <div class="section prompt-section">
                <div class="section-label">이미지 프롬프트</div>
                <div class="section-content mono">${escapeHtml(cut.prompt)}</div>
                ${cut.promptKr ? `<div class="prompt-kr">${escapeHtml(cut.promptKr)}</div>` : ''}
              </div>

              <!-- 동영상 프롬프트 -->
              <div class="section video-section">
                <div class="section-label">동영상 프롬프트</div>
                <div class="section-content mono">${cut.videoPrompt ? escapeHtml(cut.videoPrompt) : '<span class="no-content">동영상 프롬프트 없음</span>'}</div>
              </div>
            </div>

            ${imageUrl ? `
              <div class="right-content">
                <img src="${imageUrl}" alt="씬 ${scene.sceneNumber} 컷 ${cut.cutNumber}" class="preview-image" />
              </div>
            ` : ''}
          </div>
        </div>
      `;
    });

    scenesHtml += `
      <div class="scene">
        <div class="scene-header">씬 ${scene.sceneNumber}: ${escapeHtml(scene.sceneTitle || '')}</div>
        <div class="scene-body">${cutsHtml}</div>
      </div>
    `;
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(script.title || '방송대본')}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
          font-size: 11px;
          line-height: 1.6;
          color: #333;
          background: #fff;
          padding: ${format === 'pdf' ? '20px' : '30px'};
        }

        /* 문서 헤더 */
        .document-header {
          text-align: center;
          border-bottom: 4px solid #4F46E5;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }

        .document-title {
          font-size: 24px;
          font-weight: bold;
          color: #1E1B4B;
          margin-bottom: 10px;
        }

        .document-meta {
          color: #6B7280;
          font-size: 12px;
        }

        /* 씬 */
        .scene {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }

        .scene-header {
          background: linear-gradient(135deg, #4F46E5, #6366F1);
          color: white;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: bold;
          border-radius: 8px 8px 0 0;
        }

        .scene-body {
          border: 1px solid #E5E7EB;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }

        /* 컷 */
        .cut {
          padding: 20px;
          border-bottom: 1px solid #E5E7EB;
          page-break-inside: avoid;
        }

        .cut:last-child {
          border-bottom: none;
        }

        .cut-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #F3F4F6;
        }

        .cut-number {
          width: 32px;
          height: 32px;
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
          color: #4338CA;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }

        .duration {
          color: #9CA3AF;
          font-size: 11px;
        }

        .cut-body {
          display: flex;
          gap: 20px;
        }

        .left-content {
          flex: 1;
        }

        .right-content {
          width: 200px;
          flex-shrink: 0;
        }

        .preview-image {
          width: 100%;
          border-radius: 8px;
          border: 1px solid #E5E7EB;
        }

        /* 섹션 공통 */
        .section {
          margin-bottom: 12px;
          border-radius: 8px;
          padding: 12px;
        }

        .section-label {
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .section-content {
          font-size: 12px;
          line-height: 1.7;
        }

        .section-content.mono {
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 10px;
          background: white;
          padding: 10px;
          border-radius: 6px;
          word-break: break-word;
        }

        /* 나레이션 섹션 */
        .audio-section {
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
        }

        .audio-section .section-label {
          color: #1D4ED8;
        }

        .audio-section .section-content {
          color: #1E40AF;
        }

        /* 이미지 프롬프트 섹션 */
        .prompt-section {
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
        }

        .prompt-section .section-label {
          color: #374151;
        }

        .prompt-section .section-content {
          color: #4B5563;
          border: 1px solid #E5E7EB;
        }

        .prompt-kr {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid #E5E7EB;
          font-size: 10px;
          color: #6B7280;
        }

        /* 동영상 프롬프트 섹션 */
        .video-section {
          background: #FAF5FF;
          border: 1px solid #E9D5FF;
        }

        .video-section .section-label {
          color: #7C3AED;
        }

        .video-section .section-content {
          color: #5B21B6;
          border: 1px solid #E9D5FF;
        }

        .no-content {
          color: #A78BFA;
          font-style: italic;
        }

        /* 문서 푸터 */
        .document-footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #E5E7EB;
          color: #9CA3AF;
          font-size: 10px;
        }

        @media print {
          body {
            padding: 0;
          }
          .scene {
            page-break-inside: avoid;
          }
          .cut {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="document-header">
        <div class="document-title">${escapeHtml(script.title || '방송대본')}</div>
        <div class="document-meta">
          러닝타임: ${Math.floor(script.totalDuration / 60)}분 ${script.totalDuration % 60}초 |
          씬: ${script.scenes?.length || 0}개 |
          컷: ${totalCuts}개 |
          생성일: ${new Date().toLocaleDateString('ko-KR')}
        </div>
      </div>

      ${scenesHtml}

      <div class="document-footer">
        AI 방송 대본 생성기 | 생성일: ${new Date().toLocaleDateString('ko-KR')} ${new Date().toLocaleTimeString('ko-KR')}
      </div>
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
