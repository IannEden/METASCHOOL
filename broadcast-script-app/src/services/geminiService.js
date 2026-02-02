const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function generateScript(apiKey, { topic, runningTime, synopsis, notes, styleAnalysis, characters, autoCastCharacters }) {
  // Calculate target cut count (4-10 seconds per cut)
  const minCuts = Math.ceil(runningTime / 10);
  const maxCuts = Math.floor(runningTime / 4);
  const targetCuts = Math.round((minCuts + maxCuts) / 2);

  // Build character descriptions
  let characterDescriptions = '';
  if (characters && characters.length > 0) {
    characterDescriptions = '\n\n등장인물 레퍼런스:\n' +
      characters.map(c => `- ${c.name}: ${c.analysis}`).join('\n');
  }
  if (autoCastCharacters && autoCastCharacters.length > 0) {
    characterDescriptions += '\n\n자동 캐스팅된 인물:\n' +
      autoCastCharacters.map(c => `- ${c.name}: ${c.description}`).join('\n');
  }

  // Build style instruction
  const styleInstruction = styleAnalysis
    ? `\n\n모든 영상 프롬프트에 다음 스타일을 적용하세요: ${styleAnalysis}`
    : '';

  const prompt = `당신은 전문 방송 대본 작가입니다. 다음 정보를 바탕으로 교육 콘텐츠 영상 대본을 작성하세요.

주제: ${topic}
러닝타임: ${runningTime}초
시놉시스: ${synopsis}
${notes ? `참고사항: ${notes}` : ''}
${characterDescriptions}
${styleInstruction}

요구사항:
1. 총 ${targetCuts}개 내외의 컷으로 구성하세요 (최소 ${minCuts}컷, 최대 ${maxCuts}컷)
2. 각 컷은 4~10초 분량으로 설계하세요
3. 씬(Scene)과 컷(Cut)으로 논리적으로 구분하세요
4. 각 컷에는 다음을 포함하세요:
   - 샷 타입 (Wide Shot, Medium Shot, Close-up, Extreme Close-up, Over-the-shoulder, POV 등)
   - 오디오 (나레이션 또는 대사)
   - 영문 영상 프롬프트 (Midjourney/DALL-E 스타일, 고증에 충실하고 시네마틱하게)
   - 한글 해석

반드시 다음 JSON 형식으로만 응답하세요:
{
  "title": "대본 제목",
  "totalDuration": ${runningTime},
  "scenes": [
    {
      "sceneNumber": 1,
      "sceneTitle": "씬 제목",
      "cuts": [
        {
          "cutNumber": 1,
          "duration": 5,
          "shotType": "Wide Shot",
          "audio": "나레이션 또는 대사 내용",
          "prompt": "Cinematic wide shot of..., 16:9 aspect ratio, film grain, dramatic lighting",
          "promptKr": "한글 해석..."
        }
      ]
    }
  ]
}`;

  const response = await fetch(`${GEMINI_API_BASE}/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Script generation failed');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error('No response from AI');
  }

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format');
  }

  const jsonStr = jsonMatch[1] || jsonMatch[0];
  return JSON.parse(jsonStr);
}

export async function analyzeStyleReference(apiKey, imageBase64) {
  const prompt = `이 이미지의 시각적 스타일을 분석해주세요. 다음 요소들을 영어로 설명해주세요:
1. Art style (e.g., photorealistic, painterly, anime, etc.)
2. Color palette and tone
3. Lighting style
4. Mood and atmosphere
5. Texture and detail level

이 스타일을 다른 이미지 생성 프롬프트에 적용할 수 있도록 간결한 스타일 설명문(영문)을 작성해주세요.
형식: "Style: [간결한 스타일 설명]"`;

  const response = await fetch(`${GEMINI_API_BASE}/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
        ]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Style analysis failed');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function analyzeCharacterReference(apiKey, imageBase64, characterName) {
  const prompt = `이 인물 사진을 분석해주세요. "${characterName}"(이)라는 캐릭터로 사용됩니다.

다음 요소들을 영어로 상세히 설명해주세요:
1. Physical appearance (age, gender, facial features, body type)
2. Clothing and accessories
3. Hair style and color
4. Distinguishing features

이 캐릭터를 이미지 생성 프롬프트에 사용할 수 있도록 간결한 외모 설명문(영문)을 작성해주세요.`;

  const response = await fetch(`${GEMINI_API_BASE}/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
        ]
      }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Character analysis failed');
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function autoCastCharacters(apiKey, synopsis) {
  const prompt = `다음 시놉시스를 분석하여 등장해야 할 역사적 인물들을 도출하고, 각 인물의 역사적 사실에 기반한 외모 묘사를 작성해주세요.

시놉시스: ${synopsis}

각 인물에 대해 다음을 포함해주세요:
1. 인물 이름 (한글)
2. 역사적 배경 설명 (간단히)
3. 외모 묘사 (영문, 이미지 생성 프롬프트용)

반드시 다음 JSON 형식으로만 응답하세요:
{
  "characters": [
    {
      "name": "인물 이름",
      "background": "역사적 배경",
      "description": "A [age]-year-old [nationality] [title/occupation], [physical description], wearing [clothing description], [additional details]"
    }
  ]
}`;

  const response = await fetch(`${GEMINI_API_BASE}/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 2048,
      }
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Auto-casting failed');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid response format');
  }

  const jsonStr = jsonMatch[1] || jsonMatch[0];
  return JSON.parse(jsonStr).characters || [];
}
