import { useState } from 'react';
import {
  Key,
  FileText,
  Clock,
  Image,
  Users,
  Sparkles,
  Play,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Trash2,
  FlaskConical
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ImageDropzone from './ImageDropzone';
import Spinner from './Spinner';
import { extractBase64Data, getMimeType } from '../utils/imageUtils';
import {
  generateScript,
  analyzeStyleReference,
  analyzeCharacterReference,
  autoCastCharacters
} from '../services/geminiService';
import { generateDemoScript } from '../utils/demoData';

const RUNNING_TIME_OPTIONS = [
  { label: '30초', value: 30 },
  { label: '1분', value: 60 },
  { label: '1분 30초', value: 90 },
  { label: '2분', value: 120 },
  { label: '2분 30초', value: 150 },
  { label: '3분', value: 180 },
  { label: '3분 30초', value: 210 },
  { label: '4분', value: 240 },
  { label: '4분 30초', value: 270 },
  { label: '5분', value: 300 },
];

export default function LeftPanel() {
  const { state, dispatch } = useApp();
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    style: true,
    characters: true,
  });
  const [newCharacterName, setNewCharacterName] = useState('');
  const [error, setError] = useState('');
  const [testMode, setTestMode] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 스타일 이미지 선택 - API 없이도 업로드 가능
  const handleStyleImageSelect = async (dataUrl) => {
    // 먼저 이미지 저장
    dispatch({
      type: 'SET_STYLE_REFERENCE',
      payload: { image: dataUrl, analysis: '' }
    });
    setError('');

    // API 키 있으면 분석 진행
    if (state.apiKey && !testMode) {
      dispatch({ type: 'SET_LOADING', payload: { key: 'isAnalyzingStyle', value: true } });
      try {
        const base64Data = extractBase64Data(dataUrl);
        const mimeType = getMimeType(dataUrl);
        const analysis = await analyzeStyleReference(state.apiKey, base64Data, mimeType);
        dispatch({
          type: 'SET_STYLE_REFERENCE',
          payload: { image: dataUrl, analysis }
        });
      } catch (err) {
        console.error('Style analysis error:', err);
        // 분석 실패해도 이미지는 유지
        setError('스타일 분석 실패 (이미지는 저장됨): ' + err.message);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { key: 'isAnalyzingStyle', value: false } });
      }
    } else if (testMode) {
      // 테스트 모드: 더미 분석 결과
      dispatch({
        type: 'SET_STYLE_REFERENCE',
        payload: { image: dataUrl, analysis: '[테스트 모드] Style: Cinematic, warm golden lighting, photorealistic, film grain texture' }
      });
    }
  };

  // 캐릭터 이미지 선택 - API 없이도 업로드 가능
  const handleCharacterImageSelect = async (dataUrl) => {
    const charName = newCharacterName.trim() || '캐릭터 ' + (state.characters.length + 1);

    // 먼저 캐릭터 저장
    const newChar = {
      id: Date.now(),
      name: charName,
      image: dataUrl,
      analysis: ''
    };

    dispatch({ type: 'ADD_CHARACTER', payload: newChar });
    setNewCharacterName('');
    setError('');

    // API 키 있으면 분석 진행
    if (state.apiKey && !testMode) {
      dispatch({ type: 'SET_LOADING', payload: { key: 'isAnalyzingCharacter', value: true } });
      try {
        const base64Data = extractBase64Data(dataUrl);
        const mimeType = getMimeType(dataUrl);
        const analysis = await analyzeCharacterReference(state.apiKey, base64Data, mimeType, charName);
        dispatch({
          type: 'UPDATE_CHARACTER_ANALYSIS',
          payload: { id: newChar.id, analysis }
        });
      } catch (err) {
        console.error('Character analysis error:', err);
        setError('캐릭터 분석 실패 (이미지는 저장됨): ' + err.message);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { key: 'isAnalyzingCharacter', value: false } });
      }
    } else if (testMode) {
      // 테스트 모드: 더미 분석 결과
      dispatch({
        type: 'UPDATE_CHARACTER_ANALYSIS',
        payload: { id: newChar.id, analysis: `[테스트 모드] ${charName}: Middle-aged male, traditional clothing, dignified appearance` }
      });
    }
  };

  const handleAutoCast = async () => {
    if (!state.synopsis.trim()) {
      setError('시놉시스를 먼저 입력해주세요.');
      return;
    }

    if (testMode) {
      // 테스트 모드: 더미 캐스팅
      dispatch({
        type: 'SET_AUTO_CAST_CHARACTERS',
        payload: [
          { name: '피타고라스', description: '[테스트] Ancient Greek philosopher, white robes, long beard' },
          { name: '유클리드', description: '[테스트] Elderly mathematician, scholarly appearance' }
        ]
      });
      return;
    }

    if (!state.apiKey) {
      setError('API 키를 입력하거나 테스트 모드를 사용해주세요.');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: { key: 'isAutoCasting', value: true } });
    try {
      const characters = await autoCastCharacters(state.apiKey, state.synopsis);
      dispatch({ type: 'SET_AUTO_CAST_CHARACTERS', payload: characters });
      setError('');
    } catch (err) {
      setError('자동 캐스팅 실패: ' + err.message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'isAutoCasting', value: false } });
    }
  };

  const handleGenerateScript = async () => {
    if (!state.topic.trim()) {
      setError('주제를 입력해주세요.');
      return;
    }
    if (!state.synopsis.trim()) {
      setError('시놉시스를 입력해주세요.');
      return;
    }

    if (testMode) {
      // 테스트 모드: 더미 대본 생성
      dispatch({ type: 'SET_LOADING', payload: { key: 'isGeneratingScript', value: true } });
      setTimeout(() => {
        const demoScript = generateDemoScript(state.topic, state.runningTime);
        dispatch({ type: 'SET_SCRIPT', payload: demoScript });
        dispatch({ type: 'SET_LOADING', payload: { key: 'isGeneratingScript', value: false } });
      }, 1000);
      return;
    }

    if (!state.apiKey) {
      setError('API 키를 입력하거나 테스트 모드를 사용해주세요.');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: { key: 'isGeneratingScript', value: true } });
    try {
      const script = await generateScript(state.apiKey, {
        topic: state.topic,
        runningTime: state.runningTime,
        synopsis: state.synopsis,
        notes: state.notes,
        styleAnalysis: state.styleReference?.analysis,
        characters: state.characters,
        autoCastCharacters: state.autoCastCharacters
      });
      dispatch({ type: 'SET_SCRIPT', payload: script });
      setError('');
    } catch (err) {
      setError('대본 생성 실패: ' + err.message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'isGeneratingScript', value: false } });
    }
  };

  const handleReset = () => {
    if (confirm('모든 내용을 초기화하시겠습니까?')) {
      dispatch({ type: 'RESET' });
    }
  };

  return (
    <div className="w-96 h-screen bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-600 to-indigo-700">
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText size={22} />
          AI 방송 대본 생성기
        </h1>
        <p className="text-indigo-200 text-xs mt-1">EBS 교육방송 전문 작가 도구</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Test Mode Toggle */}
        <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <FlaskConical size={16} className="text-amber-600" />
            <span className="text-sm font-medium text-amber-700">테스트 모드</span>
            <span className="text-xs text-amber-500">(API 미사용)</span>
          </div>
          <button
            onClick={() => setTestMode(!testMode)}
            className={`relative w-12 h-6 rounded-full transition-colors ${testMode ? 'bg-amber-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${testMode ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* API Key - 테스트 모드면 숨김 */}
        {!testMode && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Key size={16} />
              Google AI API Key
            </label>
            <input
              type="password"
              value={state.apiKey}
              onChange={(e) => dispatch({ type: 'SET_API_KEY', payload: e.target.value })}
              placeholder="API 키를 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
        )}

        {/* Basic Info Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('basic')}
            className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <span className="flex items-center gap-2 font-medium text-gray-700">
              <FileText size={16} />
              기본 정보
            </span>
            {expandedSections.basic ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {expandedSections.basic && (
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">주제</label>
                <input
                  type="text"
                  value={state.topic}
                  onChange={(e) => dispatch({ type: 'SET_TOPIC', payload: e.target.value })}
                  placeholder="예: 피타고라스 정리의 발견"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-1">
                  <Clock size={14} />
                  러닝타임
                </label>
                <select
                  value={state.runningTime}
                  onChange={(e) => dispatch({ type: 'SET_RUNNING_TIME', payload: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  {RUNNING_TIME_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  예상 컷 수: {Math.ceil(state.runningTime / 10)} ~ {Math.floor(state.runningTime / 4)}컷
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">시놉시스</label>
                <textarea
                  value={state.synopsis}
                  onChange={(e) => dispatch({ type: 'SET_SYNOPSIS', payload: e.target.value })}
                  placeholder="콘텐츠의 주요 내용과 전개를 설명해주세요..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">참고사항 (선택)</label>
                <textarea
                  value={state.notes}
                  onChange={(e) => dispatch({ type: 'SET_NOTES', payload: e.target.value })}
                  placeholder="추가 참고사항이나 요청사항..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Style Reference Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('style')}
            className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <span className="flex items-center gap-2 font-medium text-gray-700">
              <Image size={16} />
              스타일 레퍼런스
            </span>
            {expandedSections.style ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {expandedSections.style && (
            <div className="p-4 space-y-3">
              <ImageDropzone
                label="스타일 이미지 업로드"
                onImageSelect={handleStyleImageSelect}
                preview={state.styleReference?.image}
                onRemove={() => dispatch({ type: 'SET_STYLE_REFERENCE', payload: null })}
                isLoading={state.isAnalyzingStyle}
              />
              {state.styleReference?.analysis && (
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <p className="text-xs text-indigo-700 font-medium mb-1">분석된 스타일:</p>
                  <p className="text-xs text-indigo-600">{state.styleReference.analysis}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Characters Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('characters')}
            className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <span className="flex items-center gap-2 font-medium text-gray-700">
              <Users size={16} />
              등장인물
            </span>
            {expandedSections.characters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          {expandedSections.characters && (
            <div className="p-4 space-y-3">
              {/* Auto Casting */}
              <button
                onClick={handleAutoCast}
                disabled={state.isAutoCasting || !state.synopsis}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {state.isAutoCasting ? (
                  <Spinner size={16} />
                ) : (
                  <Sparkles size={16} />
                )}
                자동 캐스팅 (시놉시스 분석)
              </button>

              {/* Auto Cast Results */}
              {state.autoCastCharacters.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500">자동 캐스팅된 인물:</p>
                  {state.autoCastCharacters.map((char, idx) => (
                    <div key={idx} className="p-2 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium text-purple-700">{char.name}</p>
                      <p className="text-xs text-purple-600 mt-1">{char.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Manual Character Add */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <p className="text-xs font-medium text-gray-500 mb-2">인물 레퍼런스 추가:</p>
                <input
                  type="text"
                  value={newCharacterName}
                  onChange={(e) => setNewCharacterName(e.target.value)}
                  placeholder="캐릭터 이름 (선택사항)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm mb-2"
                />
                <ImageDropzone
                  label="인물 이미지 업로드"
                  onImageSelect={handleCharacterImageSelect}
                  isLoading={state.isAnalyzingCharacter}
                />
              </div>

              {/* Character List */}
              {state.characters.length > 0 && (
                <div className="space-y-2 mt-3">
                  <p className="text-xs font-medium text-gray-500">등록된 인물:</p>
                  {state.characters.map((char) => (
                    <div key={char.id} className="flex gap-2 p-2 bg-gray-50 rounded-lg">
                      <img
                        src={char.image}
                        alt={char.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-700">{char.name}</p>
                        <p className="text-xs text-gray-500 truncate">{char.analysis || '분석 대기중...'}</p>
                      </div>
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_CHARACTER', payload: char.id })}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-2">
        <button
          onClick={handleGenerateScript}
          disabled={state.isGeneratingScript || !state.topic || !state.synopsis}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${testMode ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {state.isGeneratingScript ? (
            <>
              <Spinner size={20} className="text-white" />
              대본 생성 중...
            </>
          ) : (
            <>
              <Play size={20} />
              {testMode ? '테스트 대본 생성' : '대본 생성하기'}
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
        >
          <RefreshCw size={16} />
          초기화
        </button>
      </div>
    </div>
  );
}
