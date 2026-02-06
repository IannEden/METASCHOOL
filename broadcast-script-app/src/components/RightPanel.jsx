import { useState } from 'react';
import {
  FileText,
  Download,
  Image,
  ZoomIn,
  Film,
  Volume2,
  Camera,
  Clock,
  RefreshCw,
  Edit3,
  Check,
  X,
  FileDown,
  Mic
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateImage, downloadImage } from '../services/imagenService';
import { exportToWord, exportToPDF } from '../utils/wordExport';
import Spinner from './Spinner';

const SHOT_TYPE_COLORS = {
  'Wide Shot': 'bg-blue-100 text-blue-700',
  'Medium Shot': 'bg-green-100 text-green-700',
  'Close-up': 'bg-orange-100 text-orange-700',
  'Extreme Close-up': 'bg-red-100 text-red-700',
  'Over-the-shoulder': 'bg-purple-100 text-purple-700',
  'POV': 'bg-pink-100 text-pink-700',
  'Two Shot': 'bg-teal-100 text-teal-700',
  'Establishing Shot': 'bg-indigo-100 text-indigo-700',
};

export default function RightPanel() {
  const { state, dispatch } = useApp();
  const { script, generatedImages, generatingImageFor, styleReference } = state;
  const [viewMode, setViewMode] = useState('full'); // 'full' | 'audio'
  const [editingPrompt, setEditingPrompt] = useState(null); // { sceneIdx, cutIdx }
  const [editedPromptText, setEditedPromptText] = useState('');

  const handleGenerateImage = async (sceneNum, cutNum, prompt) => {
    if (!state.apiKey) {
      alert('API 키를 먼저 입력해주세요.');
      return;
    }

    const key = `${sceneNum}-${cutNum}`;
    dispatch({ type: 'SET_LOADING', payload: { key: 'generatingImageFor', value: key } });

    try {
      const imageUrl = await generateImage(
        state.apiKey,
        prompt,
        styleReference?.analysis || ''
      );
      dispatch({
        type: 'SET_GENERATED_IMAGE',
        payload: { key, url: imageUrl }
      });
    } catch (err) {
      console.error('Image generation failed:', err);
      alert('이미지 생성 실패: ' + err.message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { key: 'generatingImageFor', value: null } });
    }
  };

  const handleRegenerateImage = async (sceneNum, cutNum, prompt) => {
    // Delete existing image first
    const key = `${sceneNum}-${cutNum}`;
    dispatch({ type: 'REMOVE_GENERATED_IMAGE', payload: key });
    // Generate new one
    await handleGenerateImage(sceneNum, cutNum, prompt);
  };

  const handleImageClick = (imageUrl, caption) => {
    dispatch({
      type: 'SET_MODAL_IMAGE',
      payload: {
        url: imageUrl,
        caption,
        filename: `${caption}.png`
      }
    });
  };

  const handleDownloadImage = (imageUrl, filename) => {
    try {
      // For base64 images, create a proper download
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    } catch (err) {
      console.error('Download failed:', err);
      alert('다운로드 실패');
    }
  };

  const handleExportWord = () => {
    if (script) {
      exportToWord(script, generatedImages);
    }
  };

  const handleExportPDF = () => {
    if (script) {
      exportToPDF(script, generatedImages);
    }
  };

  const startEditPrompt = (sceneIdx, cutIdx, currentPrompt) => {
    setEditingPrompt({ sceneIdx, cutIdx });
    setEditedPromptText(currentPrompt);
  };

  const saveEditedPrompt = () => {
    if (editingPrompt) {
      dispatch({
        type: 'UPDATE_CUT_PROMPT',
        payload: {
          sceneIdx: editingPrompt.sceneIdx,
          cutIdx: editingPrompt.cutIdx,
          prompt: editedPromptText
        }
      });
      setEditingPrompt(null);
      setEditedPromptText('');
    }
  };

  const cancelEditPrompt = () => {
    setEditingPrompt(null);
    setEditedPromptText('');
  };

  const getShotTypeColor = (shotType) => {
    for (const [key, value] of Object.entries(SHOT_TYPE_COLORS)) {
      if (shotType?.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    return 'bg-gray-100 text-gray-700';
  };

  if (!script) {
    return (
      <div className="flex-1 h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-indigo-100 rounded-full flex items-center justify-center">
            <Film size={48} className="text-indigo-400" />
          </div>
          <h2 className="text-xl font-medium text-gray-700 mb-2">대본을 생성해주세요</h2>
          <p className="text-gray-500 max-w-md">
            좌측 패널에서 주제, 러닝타임, 시놉시스를 입력하고<br />
            "대본 생성하기" 버튼을 클릭하세요.
          </p>
        </div>
      </div>
    );
  }

  // Calculate total cuts
  const totalCuts = script.scenes?.reduce((acc, scene) => acc + (scene.cuts?.length || 0), 0) || 0;

  // Get all audio scripts
  const getAllAudioScripts = () => {
    const scripts = [];
    script.scenes?.forEach((scene, sceneIdx) => {
      scripts.push({ type: 'scene', title: `씬 ${scene.sceneNumber}: ${scene.sceneTitle || ''}` });
      scene.cuts?.forEach((cut) => {
        scripts.push({
          type: 'cut',
          cutNumber: cut.cutNumber,
          duration: cut.duration,
          audio: cut.audio
        });
      });
    });
    return scripts;
  };

  return (
    <div className="flex-1 h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{script.title || '생성된 대본'}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {script.totalDuration}초
              </span>
              <span className="flex items-center gap-1">
                <Film size={14} />
                {script.scenes?.length || 0}씬
              </span>
              <span className="flex items-center gap-1">
                <Camera size={14} />
                {totalCuts}컷
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportWord}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <FileDown size={16} />
              Word
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <FileDown size={16} />
              PDF
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('full')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'full'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Film size={14} />
            전체 보기
          </button>
          <button
            onClick={() => setViewMode('audio')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'audio'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Mic size={14} />
            나레이션만
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === 'audio' ? (
          /* Audio Script View */
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Mic size={20} />
              나레이션 스크립트
            </h3>
            <div className="space-y-4">
              {getAllAudioScripts().map((item, idx) => (
                item.type === 'scene' ? (
                  <div key={idx} className="pt-4 first:pt-0">
                    <h4 className="font-bold text-indigo-700 border-b border-indigo-200 pb-2">
                      {item.title}
                    </h4>
                  </div>
                ) : (
                  <div key={idx} className="flex gap-3">
                    <div className="flex-shrink-0 w-16 text-right">
                      <span className="text-xs font-medium text-gray-400">
                        #{item.cutNumber} ({item.duration}초)
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed flex-1">
                      {item.audio}
                    </p>
                  </div>
                )
              ))}
            </div>
          </div>
        ) : (
          /* Full View */
          <div className="max-w-4xl mx-auto space-y-6">
            {script.scenes?.map((scene, sceneIdx) => (
              <div
                key={sceneIdx}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in"
              >
                {/* Scene Header */}
                <div className="px-5 py-3 bg-indigo-50 border-b border-indigo-100">
                  <h3 className="font-bold text-indigo-800">
                    씬 {scene.sceneNumber}: {scene.sceneTitle || ''}
                  </h3>
                </div>

                {/* Cuts */}
                <div className="divide-y divide-gray-100">
                  {scene.cuts?.map((cut, cutIdx) => {
                    const imageKey = `${scene.sceneNumber}-${cut.cutNumber}`;
                    const generatedImage = generatedImages[imageKey];
                    const isGenerating = generatingImageFor === imageKey;
                    const isEditing = editingPrompt?.sceneIdx === sceneIdx && editingPrompt?.cutIdx === cutIdx;

                    return (
                      <div key={cutIdx} className="p-5">
                        {/* Cut Header */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white text-sm font-bold rounded-full">
                            {cut.cutNumber}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getShotTypeColor(cut.shotType)}`}>
                            {cut.shotType}
                          </span>
                          {cut.duration && (
                            <span className="text-xs text-gray-400">
                              {cut.duration}초
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Left: Audio & Prompt */}
                          <div className="space-y-3">
                            {/* Audio */}
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <div className="flex items-center gap-2 text-blue-700 text-xs font-medium mb-1">
                                <Volume2 size={14} />
                                오디오 ({cut.duration}초)
                              </div>
                              <p className="text-sm text-blue-900">{cut.audio}</p>
                            </div>

                            {/* Prompt */}
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between text-gray-600 text-xs font-medium mb-1">
                                <div className="flex items-center gap-2">
                                  <FileText size={14} />
                                  영상 프롬프트
                                </div>
                                {!isEditing && (
                                  <button
                                    onClick={() => startEditPrompt(sceneIdx, cutIdx, cut.prompt)}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    title="프롬프트 수정"
                                  >
                                    <Edit3 size={12} />
                                  </button>
                                )}
                              </div>
                              {isEditing ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editedPromptText}
                                    onChange={(e) => setEditedPromptText(e.target.value)}
                                    className="w-full p-2 text-xs font-mono border border-gray-300 rounded resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    rows={4}
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={cancelEditPrompt}
                                      className="p-1.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                                    >
                                      <X size={14} />
                                    </button>
                                    <button
                                      onClick={saveEditedPrompt}
                                      className="p-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                    >
                                      <Check size={14} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-xs text-gray-700 font-mono leading-relaxed">
                                    {cut.prompt}
                                  </p>
                                  {cut.promptKr && (
                                    <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                                      {cut.promptKr}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Right: Image Preview */}
                          <div className="flex flex-col">
                            {generatedImage ? (
                              <div className="relative group">
                                <img
                                  src={generatedImage}
                                  alt={`씬 ${scene.sceneNumber} 컷 ${cut.cutNumber}`}
                                  className="w-full aspect-video object-cover rounded-lg border border-gray-200 cursor-pointer"
                                  onClick={() => handleImageClick(
                                    generatedImage,
                                    `씬${scene.sceneNumber}_컷${cut.cutNumber}`
                                  )}
                                />
                                <div
                                  className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center cursor-pointer"
                                  onClick={() => handleImageClick(
                                    generatedImage,
                                    `씬${scene.sceneNumber}_컷${cut.cutNumber}`
                                  )}
                                >
                                  <ZoomIn
                                    size={32}
                                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  />
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => handleImageClick(
                                      generatedImage,
                                      `씬${scene.sceneNumber}_컷${cut.cutNumber}`
                                    )}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                  >
                                    <ZoomIn size={14} />
                                    확대
                                  </button>
                                  <button
                                    onClick={() => handleDownloadImage(
                                      generatedImage,
                                      `씬${scene.sceneNumber}_컷${cut.cutNumber}.png`
                                    )}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                                  >
                                    <Download size={14} />
                                    다운로드
                                  </button>
                                  <button
                                    onClick={() => handleRegenerateImage(
                                      scene.sceneNumber,
                                      cut.cutNumber,
                                      cut.prompt
                                    )}
                                    disabled={isGenerating}
                                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors disabled:opacity-50"
                                  >
                                    <RefreshCw size={14} className={isGenerating ? 'animate-spin' : ''} />
                                    다시
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleGenerateImage(
                                  scene.sceneNumber,
                                  cut.cutNumber,
                                  cut.prompt
                                )}
                                disabled={isGenerating || !state.apiKey}
                                className="w-full aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isGenerating ? (
                                  <>
                                    <Spinner size={32} />
                                    <span className="text-sm text-indigo-600 mt-2">
                                      이미지 생성 중...
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <Image size={32} className="text-indigo-400" />
                                    <span className="text-sm text-indigo-600 mt-2 font-medium">
                                      미리보기 생성
                                    </span>
                                    <span className="text-xs text-indigo-400 mt-1">
                                      클릭하여 이미지 생성
                                    </span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
