const IMAGEN_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function generateImage(apiKey, prompt, styleAnalysis = '') {
  // Combine prompt with style analysis
  const fullPrompt = styleAnalysis
    ? `${prompt}. ${styleAnalysis}`
    : prompt;

  // Using Gemini's image generation capability (Imagen 3)
  const response = await fetch(`${IMAGEN_API_BASE}/imagen-3.0-generate-002:predict?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instances: [{ prompt: fullPrompt }],
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
    // Fallback to alternative API format if the first one fails
    return await generateImageFallback(apiKey, fullPrompt);
  }

  const data = await response.json();

  if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
    return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
  }

  throw new Error('Image generation failed');
}

async function generateImageFallback(apiKey, prompt) {
  // Alternative: Use Gemini 2.0 Flash with image generation
  const response = await fetch(`${IMAGEN_API_BASE}/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `Generate a cinematic 16:9 image: ${prompt}` }]
      }],
      generationConfig: {
        responseModalities: ['image', 'text'],
        imageSafetySetting: 'block_only_high'
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Image generation failed');
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error('No image in response');
}

export function downloadImage(imageUrl, filename) {
  const link = document.createElement('a');
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
