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
  Mic,
  Video
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateImage } from '../services/imagenService';
import { exportToWord, exportToPDF } from '../utils/wordExport';
import Spinner from './Spinner';

export default function RightPanel() {
  const { state, dispatch } = useApp();
  const { script, generatedImages, generatingImageFor, styleReference } = state;
  const [viewMode, setViewMode] = useState('document'); // 'document' | 'audio'
  const [editingPrompt, setEditingPrompt] = useState(null);
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
    const key = `${sceneNum}-${cutNum}`;
    dispatch({ type: 'REMOVE_GENERATED_IMAGE', payload: key });
    await handleGenerateImage(sceneNum, cutNum, prompt);
  };

  const handleImageClick = (imageUrl, caption) => {
    dispatch({
      type: 'SET_MODAL_IMAGE',
      payload: { url: imageUrl, caption, filename: `${caption}.png` }
    });
  };

  const handleDownloadImage = (imageUrl, filename) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 100);
    } catch (err) {
      console.error('Download failed:', err);
      alert('다운로드 실패');
    }
  };

  const handleExportWord = () => {
    if (script) exportToWord(script, generatedImages);
  };

  const handleExportPDF = () => {
    if (script) exportToPDF(script, generatedImages);
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

  if (!script) {
    return (
      <div className="flex-1 h-screen bg-gray-100 flex items-center justify-center">
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

  const totalCuts = script.scenes?.reduce((acc, scene) => acc + (scene.cuts?.length || 0), 0) || 0;

  return (
    <div className="flex-1 h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header - 문서 스타일 */}
      <div className="px-6 py-4 bg-white border-b border-gray-300 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{script.title || '생성된 대본'}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {Math.floor(script.totalDuration / 60)}분 {script.totalDuration % 60}초
              </span>
              <span className="flex items-center gap-1">
                <Film size={14} />
                {script.scenes?.length || 0}개 씬
              </span>
              <span className="flex items-center gap-1">
                <Camera size={14} />
                {totalCuts}개 컷
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-500">
                생성일: {new Date().toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportWord}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <FileDown size={16} />
              Word 저장
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              <FileDown size={16} />
              PDF 저장
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('document')}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'document'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            <FileText size={14} />
            문서 보기
          </button>
          <button
            onClick={() => setViewMode('audio')}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'audio'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
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
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-8">
            <div className="border-b-2 border-indigo-600 pb-4 mb-6">
              <h3 className="text-xl font-bold text-gray-900">나레이션 스크립트</h3>
              <p className="text-sm text-gray-500 mt-1">{script.title}</p>
            </div>
            {script.scenes?.map((scene, sceneIdx) => (
              <div key={sceneIdx} className="mb-8">
                <h4 className="font-bold text-indigo-700 text-lg mb-4 pb-2 border-b border-indigo-200">
                  씬 {scene.sceneNumber}: {scene.sceneTitle || ''}
                </h4>
                <div className="space-y-4">
                  {scene.cuts?.map((cut, cutIdx) => (
                    <div key={cutIdx} className="flex gap-4">
                      <div className="flex-shrink-0 w-20 text-right pt-1">
                        <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                          #{cut.cutNumber}
                        </span>
                        <span className="block text-xs text-gray-400 mt-1">
                          {cut.duration}초
                        </span>
                      </div>
                      <p className="flex-1 text-gray-800 leading-relaxed text-base">
                        {cut.audio}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Document View - 문서 형태 레이아웃 */
          <div className="max-w-5xl mx-auto">
            {/* Document Header */}
            <div className="bg-white rounded-t-lg shadow-lg border border-gray-200 p-8 mb-0">
              <div className="text-center border-b-4 border-indigo-600 pb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{script.title}</h1>
                <p className="text-gray-600">
                  러닝타임: {Math.floor(script.totalDuration / 60)}분 {script.totalDuration % 60}초 |
                  씬: {script.scenes?.length}개 |
                  컷: {totalCuts}개
                </p>
              </div>
            </div>

            {/* Document Body - Scenes */}
            {script.scenes?.map((scene, sceneIdx) => (
              <div key={sceneIdx} className="bg-white shadow-lg border-x border-gray-200 mb-0">
                {/* Scene Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-4">
                  <h2 className="text-lg font-bold">
                    씬 {scene.sceneNumber}: {scene.sceneTitle || ''}
                  </h2>
                </div>

                {/* Cuts as Document Rows */}
                <div className="divide-y divide-gray-200">
                  {scene.cuts?.map((cut, cutIdx) => {
                    const imageKey = `${scene.sceneNumber}-${cut.cutNumber}`;
                    const generatedImage = generatedImages[imageKey];
                    const isGenerating = generatingImageFor === imageKey;
                    const isEditing = editingPrompt?.sceneIdx === sceneIdx && editingPrompt?.cutIdx === cutIdx;

                    return (
                      <div key={cutIdx} className="p-6">
                        {/* Cut Header Row */}
                        <div className="flex items-center gap-4 mb-4 pb-3 border-b border-gray-100">
                          <span className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white text-sm font-bold rounded-full">
                            {cut.cutNumber}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                              {cut.shotType}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                              {cut.duration}초
                            </span>
                          </div>
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Left Column - Audio & Prompts */}
                          <div className="lg:col-span-2 space-y-4">
                            {/* Audio Section */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                                <Volume2 size={16} />
                                나레이션 ({cut.duration}초)
                              </div>
                              <p className="text-blue-900 leading-relaxed">{cut.audio}</p>
                            </div>

                            {/* Image Prompt Section */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                                  <Image size={16} />
                                  이미지 프롬프트
                                </div>
                                {!isEditing && (
                                  <button
                                    onClick={() => startEditPrompt(sceneIdx, cutIdx, cut.prompt)}
                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                    title="프롬프트 수정"
                                  >
                                    <Edit3 size={14} className="text-gray-500" />
                                  </button>
                                )}
                              </div>
                              {isEditing ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editedPromptText}
                                    onChange={(e) => setEditedPromptText(e.target.value)}
                                    className="w-full p-3 text-sm font-mono border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    rows={4}
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <button
                                      onClick={cancelEditPrompt}
                                      className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 text-sm"
                                    >
                                      <X size={14} />
                                    </button>
                                    <button
                                      onClick={saveEditedPrompt}
                                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                                    >
                                      <Check size={14} />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm font-mono text-gray-700 leading-relaxed bg-white p-3 rounded border border-gray-200">
                                    {cut.prompt}
                                  </p>
                                  {cut.promptKr && (
                                    <p className="text-sm text-gray-500 mt-2 pt-2 border-t border-gray-200">
                                      {cut.promptKr}
                                    </p>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Video Prompt Section */}
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                              <div className="flex items-center gap-2 text-purple-700 font-semibold mb-2">
                                <Video size={16} />
                                동영상 프롬프트
                              </div>
                              {cut.videoPrompt ? (
                                <p className="text-sm font-mono text-purple-900 leading-relaxed bg-white p-3 rounded border border-purple-200">
                                  {cut.videoPrompt}
                                </p>
                              ) : (
                                <p className="text-sm text-purple-400 italic">동영상 프롬프트 없음</p>
                              )}
                            </div>
                          </div>

                          {/* Right Column - Image Preview */}
                          <div className="lg:col-span-1">
                            <div className="sticky top-4">
                              {generatedImage ? (
                                <div className="space-y-2">
                                  <div className="relative group">
                                    <img
                                      src={generatedImage}
                                      alt={`씬 ${scene.sceneNumber} 컷 ${cut.cutNumber}`}
                                      className="w-full aspect-video object-cover rounded-lg border border-gray-200 cursor-pointer shadow-md"
                                      onClick={() => handleImageClick(
                                        generatedImage,
                                        `씬${scene.sceneNumber}_컷${cut.cutNumber}`
                                      )}
                                    />
                                    <div
                                      className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center cursor-pointer"
                                      onClick={() => handleImageClick(
                                        generatedImage,
                                        `씬${scene.sceneNumber}_컷${cut.cutNumber}`
                                      )}
                                    >
                                      <ZoomIn size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                    <button
                                      onClick={() => handleImageClick(generatedImage, `씬${scene.sceneNumber}_컷${cut.cutNumber}`)}
                                      className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                      <ZoomIn size={12} />
                                      확대
                                    </button>
                                    <button
                                      onClick={() => handleDownloadImage(generatedImage, `씬${scene.sceneNumber}_컷${cut.cutNumber}.png`)}
                                      className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                      <Download size={12} />
                                      저장
                                    </button>
                                    <button
                                      onClick={() => handleRegenerateImage(scene.sceneNumber, cut.cutNumber, cut.prompt)}
                                      disabled={isGenerating}
                                      className="flex items-center justify-center gap-1 px-2 py-1.5 text-xs bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50"
                                    >
                                      <RefreshCw size={12} className={isGenerating ? 'animate-spin' : ''} />
                                      재생성
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleGenerateImage(scene.sceneNumber, cut.cutNumber, cut.prompt)}
                                  disabled={isGenerating || !state.apiKey}
                                  className="w-full aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isGenerating ? (
                                    <>
                                      <Spinner size={28} />
                                      <span className="text-sm text-indigo-600 mt-2">생성 중...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Image size={28} className="text-indigo-400" />
                                      <span className="text-sm text-indigo-600 mt-2 font-medium">이미지 생성</span>
                                      <span className="text-xs text-indigo-400 mt-1">클릭하여 생성</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Document Footer */}
            <div className="bg-white rounded-b-lg shadow-lg border border-gray-200 p-6 text-center text-gray-500 text-sm">
              생성일: {new Date().toLocaleDateString('ko-KR')} | AI 방송 대본 생성기
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
