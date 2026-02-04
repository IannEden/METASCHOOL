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
  Trash2
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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleStyleImageSelect = async (dataUrl) => {
    if (!state.apiKey) {
      setError('API 키를 먼저 입력해주세요.');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: { key: 'isAnalyzingStyle', value: true } });
    try {
      const base64Data = extractBase64Data(dataUrl);
      const mimeType = getMimeType(dataUrl);
      const analysis = await analyzeStyleReference(state.apiKey, base64Data, mimeType);
      dispatch({
        type: 'SET_STYLE_REFERENCE',
        payload: { image: dataUrl, analysis }
      });
      setError('');
    } catch (err) {
      setError('스타일 분석 실패: ' + err.message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'isAnalyzingStyle', value: false } });
    }
  };

  const handleCharacterImageSelect = async (dataUrl) => {
    if (!state.apiKey) {
      setError('API 키를 먼저 입력해주세요.');
      return;
    }
    if (!newCharacterName.trim()) {
      setError('캐릭터 이름을 먼저 입력해주세요.');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: { key: 'isAnalyzingCharacter', value: true } });
    try {
      const base64Data = extractBase64Data(dataUrl);
      const mimeType = getMimeType(dataUrl);
      const analysis = await analyzeCharacterReference(state.apiKey, base64Data, mimeType, newCharacterName);
      dispatch({
        type: 'ADD_CHARACTER',
        payload: {
          id: Date.now(),
          name: newCharacterName,
          image: dataUrl,
          analysis
        }
      });
      setNewCharacterName('');
      setError('');
    } catch (err) {
      setError('캐릭터 분석 실패: ' + err.message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'isAnalyzingCharacter', value: false } });
    }
  };

  const handleAutoCast = async () => {
    if (!state.apiKey) {
      setError('API 키를 먼저 입력해주세요.');
      return;
    }
    if (!state.synopsis.trim()) {
      setError('시놉시스를 먼저 입력해주세요.');
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
    if (!state.apiKey) {
      setError('API 키를 먼저 입력해주세요.');
      return;
    }
    if (!state.topic.trim()) {
      setError('주제를 입력해주세요.');
      return;
    }
    if (!state.synopsis.trim()) {
      setError('시놉시스를 입력해주세요.');
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

        {/* API Key */}
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
                  placeholder="예: 조선시대 세종대왕의 한글 창제"
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
                  placeholder="캐릭터 이름"
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
                        <p className="text-xs text-gray-500 truncate">{char.analysis}</p>
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
          disabled={state.isGeneratingScript || !state.apiKey || !state.topic || !state.synopsis}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {state.isGeneratingScript ? (
            <>
              <Spinner size={20} className="text-white" />
              대본 생성 중...
            </>
          ) : (
            <>
              <Play size={20} />
              대본 생성하기
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
