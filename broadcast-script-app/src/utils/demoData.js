// Demo data generator for test mode (no API required)

export function generateDemoScript(topic, runningTime) {
  const minCuts = Math.ceil(runningTime / 10);
  const maxCuts = Math.floor(runningTime / 4);
  const targetCuts = Math.round((minCuts + maxCuts) / 2);

  // Generate demo scenes with educational content
  const scenes = [];
  let cutCounter = 0;
  let totalDuration = 0;
  const cutsPerScene = Math.ceil(targetCuts / 3);

  const demoSceneData = [
    {
      title: '도입: 역사의 시작',
      cuts: [
        {
          duration: 6,
          shotType: 'Wide Shot',
          audio: `오늘 우리가 탐구할 주제는 바로 "${topic}"입니다. 수천 년 전, 인류는 어떻게 이 개념을 발견했을까요?`,
          prompt: 'Cinematic wide shot of ancient civilization, dramatic sunrise, historical atmosphere, 16:9, photorealistic',
          promptKr: '고대 문명의 시네마틱 와이드샷, 드라마틱한 일출, 역사적 분위기',
          videoPrompt: '[Wide aerial drone shot] [Ancient Mediterranean coastal city at dawn] [Camera slowly descending toward the city, morning mist rising] [Mountains and sea in background, ancient ships in harbor] [Golden hour lighting, warm cinematic color grading, epic scale, 4K]'
        },
        {
          duration: 7,
          shotType: 'Medium Shot',
          audio: '기원전 6세기, 고대 그리스의 학자들은 자연의 비밀을 수로 풀어내기 시작했습니다.',
          prompt: 'Ancient Greek scholars studying scrolls in marble building, warm lighting, historical accurate, cinematic',
          promptKr: '대리석 건물에서 두루마리를 연구하는 고대 그리스 학자들',
          videoPrompt: '[Medium tracking shot] [Greek scholars in white togas gathered around scrolls] [Scholars discussing and pointing at mathematical diagrams, subtle gestures] [Marble columns, morning light streaming through windows] [Warm golden tones, atmospheric dust particles, classical atmosphere]'
        },
        {
          duration: 5,
          shotType: 'Close-up',
          audio: '그들의 발견은 오늘날까지 우리 삶에 깊은 영향을 미치고 있습니다.',
          prompt: 'Close-up of ancient mathematical instruments, compass and ruler on parchment, dramatic lighting',
          promptKr: '고대 수학 도구 클로즈업, 양피지 위의 컴퍼스와 자',
          videoPrompt: '[Extreme close-up with shallow depth of field] [Bronze compass and wooden ruler on aged parchment] [Hand slowly drawing geometric shapes with ink] [Candlelight flickering on the surface] [Warm sepia tones, intimate atmosphere, ASMR-like detail]'
        }
      ]
    },
    {
      title: '전개: 발견의 순간',
      cuts: [
        {
          duration: 8,
          shotType: 'Medium Wide',
          audio: '이 시대의 수학자들은 단순한 계산을 넘어, 우주의 질서를 이해하고자 했습니다. 그들에게 수학은 철학이자 예술이었습니다.',
          prompt: 'Ancient mathematician at work with geometric shapes, candlelit study room, atmospheric, film quality',
          promptKr: '기하학 도형과 함께 작업하는 고대 수학자, 촛불 서재',
          videoPrompt: '[Medium wide dolly shot] [Elderly mathematician with white beard at wooden desk] [Writing formulas while gazing at geometric models, deep in thought] [Study room with scrolls, candles, astronomical instruments] [Chiaroscuro lighting, Rembrandt-style, contemplative mood]'
        },
        {
          duration: 6,
          shotType: 'Over Shoulder',
          audio: '수많은 시행착오 끝에, 마침내 그들은 놀라운 패턴을 발견했습니다.',
          prompt: 'Over shoulder shot of scholar writing mathematical formulas, parchment and ink, warm tones',
          promptKr: '수학 공식을 쓰는 학자의 어깨 너머 샷',
          videoPrompt: '[Over-the-shoulder tracking shot] [Scholar\'s hands and parchment with geometric proofs] [Quill moving across paper, drawing connecting lines between numbers] [Desk with ink pot, sand timer, scrolls] [Warm candlelight, focused intimate atmosphere, slight camera push-in]'
        },
        {
          duration: 7,
          shotType: 'Wide Shot',
          audio: '이 발견은 당시 사회에 큰 반향을 일으켰고, 새로운 시대의 문을 열었습니다.',
          prompt: 'Ancient academy with students and teachers, grand architecture, golden hour lighting, epic scale',
          promptKr: '학생들과 교사들이 있는 고대 아카데미, 웅장한 건축',
          videoPrompt: '[Wide crane shot rising upward] [Grand ancient academy courtyard with columns and statues] [Students and teachers walking, discussing in groups, animated gestures] [Marble architecture, gardens, fountain in center] [Golden hour, lens flare, epic orchestral atmosphere, 4K cinematic]'
        }
      ]
    },
    {
      title: '결론: 현대로의 연결',
      cuts: [
        {
          duration: 6,
          shotType: 'Montage',
          audio: '수천 년이 지난 오늘날, 이 수학적 원리는 우리 일상 곳곳에 숨어있습니다.',
          prompt: 'Modern technology montage, smartphones, buildings, bridges, showing mathematical principles, sleek',
          promptKr: '현대 기술 몽타주, 스마트폰, 건물, 다리, 수학적 원리',
          videoPrompt: '[Quick-cut montage sequence] [Modern skyscrapers, smartphones, suspension bridges, satellites] [Time-lapse of city life, data flowing on screens, engineers working] [Urban environments, tech labs, construction sites] [Cool blue modern color grade, sleek transitions, dynamic pacing]'
        },
        {
          duration: 5,
          shotType: 'Close-up',
          audio: '고대의 지혜와 현대의 기술이 만나는 순간입니다.',
          prompt: 'Split screen ancient and modern mathematics, visual comparison, artistic composition',
          promptKr: '고대와 현대 수학의 분할 화면, 시각적 비교',
          videoPrompt: '[Split-screen transition effect] [Left: ancient parchment with geometric drawings / Right: modern tablet with 3D models] [Both sides animating simultaneously, showing parallel evolution] [Contrasting warm ancient / cool modern lighting] [Artistic morphing transitions, symbolic visual metaphor]'
        },
        {
          duration: 6,
          shotType: 'Wide Shot',
          audio: `"${topic}"의 이야기는 여기서 끝나지 않습니다. 여러분도 이 위대한 발견의 여정에 함께하세요.`,
          prompt: 'Inspirational ending shot, sunrise over modern city, hope and future, cinematic wide angle',
          promptKr: '영감을 주는 엔딩 샷, 현대 도시 위의 일출',
          videoPrompt: '[Wide aerial establishing shot, drone rising] [Modern city skyline with ancient ruins in foreground] [Sun rising behind buildings, birds flying across frame] [Blend of ancient and modern architecture, clear morning sky] [Golden hour transitioning to bright day, hopeful uplifting mood, epic finale]'
        }
      ]
    }
  ];

  // Build scenes based on running time
  for (let i = 0; i < 3; i++) {
    const sceneData = demoSceneData[i];
    const sceneCuts = [];

    for (let j = 0; j < sceneData.cuts.length && cutCounter < targetCuts; j++) {
      const cutData = sceneData.cuts[j];

      // Adjust duration if needed
      let duration = cutData.duration;
      if (totalDuration + duration > runningTime) {
        duration = runningTime - totalDuration;
        if (duration < 3) break;
      }

      cutCounter++;
      totalDuration += duration;

      sceneCuts.push({
        cutNumber: cutCounter,
        duration,
        shotType: cutData.shotType,
        audio: cutData.audio,
        prompt: cutData.prompt,
        promptKr: cutData.promptKr,
        videoPrompt: cutData.videoPrompt
      });

      if (totalDuration >= runningTime) break;
    }

    if (sceneCuts.length > 0) {
      scenes.push({
        sceneNumber: i + 1,
        sceneTitle: sceneData.title,
        cuts: sceneCuts
      });
    }

    if (totalDuration >= runningTime) break;
  }

  return {
    title: `[데모] ${topic}`,
    totalDuration: totalDuration,
    scenes
  };
}

export function generateDemoStyleAnalysis() {
  return 'Style: Cinematic photorealistic, warm golden lighting, dramatic shadows, film grain texture, historical atmosphere, 16:9 aspect ratio, high detail, epic composition';
}

export function generateDemoCharacterAnalysis(characterName) {
  return `${characterName}: A distinguished scholar in their 50s with wise, contemplative expression. Silver-gray hair and beard, wearing traditional academic robes. Weathered hands showing years of study. Warm, approachable demeanor with keen, intelligent eyes.`;
}

export function generateDemoAutoCast(synopsis) {
  return [
    {
      name: '고대 수학자',
      background: '기원전 6세기 그리스의 저명한 철학자이자 수학자',
      description: 'A 60-year-old ancient Greek philosopher with white beard, wearing white toga and sandals, wise expression, holding a scroll'
    },
    {
      name: '젊은 제자',
      background: '수학자의 가르침을 받는 청년 학자',
      description: 'A 25-year-old Greek student, short dark hair, wearing simple brown tunic, eager and curious expression, carrying writing tablets'
    }
  ];
}
