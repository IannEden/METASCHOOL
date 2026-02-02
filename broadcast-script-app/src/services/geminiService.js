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

  const prompt = `당신은 EBS 교육방송의 베테랑 수학사 다큐멘터리 작가입니다.
중학생(13-15세)을 대상으로 하는 수학사 교육 콘텐츠 대본을 작성합니다.

[프로젝트 정보]
주제: ${topic}
러닝타임: ${runningTime}초
시놉시스: ${synopsis}
${notes ? `참고사항: ${notes}` : ''}
${characterDescriptions}
${styleInstruction}

[핵심 작성 원칙]

1. **교육적 깊이**:
   - 모든 나레이션에는 반드시 구체적인 역사적 사실, 수학적 개념, 연도, 수치가 포함되어야 합니다
   - "피타고라스가 수학을 연구했다" (X) → "기원전 570년경 사모스 섬에서 태어난 피타고라스는, 이집트와 바빌로니아를 여행하며 수학을 배운 뒤, '만물은 수로 이루어져 있다'는 철학을 세웠습니다" (O)
   - 단순 설명이 아닌, 배경/맥락/의의까지 설명하세요

2. **나레이션 분량**:
   - 각 컷의 나레이션은 최소 2-3문장, 50-80자 이상이어야 합니다
   - 컷 하나에 하나의 완결된 정보나 이야기가 담겨야 합니다
   - 짧은 감탄사나 단순 연결어만으로 구성된 컷은 금지입니다

3. **스토리텔링**:
   - 시청자의 호기심을 자극하는 질문으로 시작하세요
   - 역사적 인물의 고민, 갈등, 발견의 순간을 생생하게 묘사하세요
   - 수학적 발견이 당시 사회에 미친 영향을 설명하세요
   - "그런데 여기서 놀라운 점은...", "하지만 문제가 있었습니다" 같은 전환을 활용하세요

4. **수학사 팩트**:
   - 정확한 연도, 장소, 인물명을 사용하세요
   - 수학 공식이나 정리가 나오면 그 의미를 쉽게 풀어서 설명하세요
   - 해당 발견이 현대에 어떻게 사용되는지 연결해주세요

[기술적 요구사항]
- 총 ${targetCuts}개 내외의 컷 (최소 ${minCuts}컷, 최대 ${maxCuts}컷)
- 각 컷은 4~10초 분량
- 씬(Scene)과 컷(Cut)으로 논리적 구분
- 영상 프롬프트는 시네마틱하고 고증에 충실하게

[JSON 출력 형식]
반드시 아래 형식의 JSON만 출력하세요:
{
  "title": "대본 제목",
  "totalDuration": ${runningTime},
  "scenes": [
    {
      "sceneNumber": 1,
      "sceneTitle": "씬 제목 (예: 피타고라스의 탄생)",
      "cuts": [
        {
          "cutNumber": 1,
          "duration": 6,
          "shotType": "Wide Shot",
          "audio": "기원전 570년경, 에게해의 작은 섬 사모스. 이곳에서 서양 수학의 아버지라 불리는 한 인물이 태어났습니다. 바로 '피타고라스'입니다. 그는 훗날 수와 도형의 비밀을 밝혀내며, 수학의 역사를 완전히 바꾸어 놓게 됩니다.",
          "prompt": "Cinematic wide shot of ancient Greek island of Samos, 6th century BC, Mediterranean sea, white stone buildings on hillside, sailing ships in harbor, morning golden light, photorealistic, 16:9, film grain",
          "promptKr": "기원전 6세기 그리스 사모스 섬의 시네마틱 와이드샷, 지중해, 언덕 위 흰 돌건물들, 항구의 범선들, 아침 황금빛"
        }
      ]
    }
  ]
}

위 예시처럼 나레이션에는 연도, 장소, 인물, 역사적 의의가 구체적으로 담겨야 합니다.`;

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

export async function analyzeStyleReference(apiKey, imageBase64, mimeType = 'image/jpeg') {
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
          { inlineData: { mimeType, data: imageBase64 } }
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

export async function analyzeCharacterReference(apiKey, imageBase64, mimeType = 'image/jpeg', characterName) {
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
          { inlineData: { mimeType, data: imageBase64 } }
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
