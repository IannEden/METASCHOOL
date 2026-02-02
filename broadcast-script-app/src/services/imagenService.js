const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function generateImage(apiKey, prompt, styleAnalysis = '') {
  // Combine prompt with style analysis
  const fullPrompt = styleAnalysis
    ? `${prompt}. Style: ${styleAnalysis}`
    : prompt;

  // Use Gemini 2.0 Flash Experimental with image generation
  const response = await fetch(`${GEMINI_API_BASE}/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Generate a high-quality cinematic image in 16:9 aspect ratio: ${fullPrompt}.
Make it photorealistic with dramatic lighting and film-quality composition.`
        }]
      }],
      generationConfig: {
        responseModalities: ['image', 'text']
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    // Try fallback with Imagen 3
    return await generateImageFallback(apiKey, fullPrompt);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  // If no image in response, try fallback
  return await generateImageFallback(apiKey, fullPrompt);
}

async function generateImageFallback(apiKey, prompt) {
  // Fallback: Try Imagen 3 API
  const response = await fetch(`${GEMINI_API_BASE}/imagen-3.0-generate-002:predict?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '16:9',
        personGeneration: 'allow_adult',
        safetySetting: 'block_only_high',
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || '이미지 생성에 실패했습니다. API 키와 할당량을 확인해주세요.');
  }

  const data = await response.json();

  if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
    return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
  }

  throw new Error('이미지 생성에 실패했습니다.');
}

export function downloadImage(imageUrl, filename) {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
