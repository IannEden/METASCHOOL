import { createContext, useContext, useReducer } from 'react';

const AppContext = createContext(null);

const initialState = {
  // API Key
  apiKey: '',

  // Script Input
  topic: '',
  runningTime: 240, // seconds (30-300), default 4분
  synopsis: '',
  notes: '',

  // Generated Script
  script: null, // { scenes: [{ sceneNumber, cuts: [{ cutNumber, shotType, audio, prompt, promptKr }] }] }

  // Style Reference
  styleReference: null, // { image: base64, analysis: string }

  // Character References
  characters: [], // [{ id, name, image: base64, analysis: string }]

  // Auto-Casting Characters
  autoCastCharacters: [], // [{ name, description }]

  // Generated Images
  generatedImages: {}, // { 'scene-cut': imageUrl }

  // Loading States
  isGeneratingScript: false,
  isAnalyzingStyle: false,
  isAnalyzingCharacter: false,
  isAutoCasting: false,
  generatingImageFor: null, // 'scene-cut' or null

  // Modal
  modalImage: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_API_KEY':
      return { ...state, apiKey: action.payload };

    case 'SET_TOPIC':
      return { ...state, topic: action.payload };

    case 'SET_RUNNING_TIME':
      return { ...state, runningTime: action.payload };

    case 'SET_SYNOPSIS':
      return { ...state, synopsis: action.payload };

    case 'SET_NOTES':
      return { ...state, notes: action.payload };

    case 'SET_SCRIPT':
      return { ...state, script: action.payload };

    case 'SET_STYLE_REFERENCE':
      return { ...state, styleReference: action.payload };

    case 'ADD_CHARACTER':
      return { ...state, characters: [...state.characters, action.payload] };

    case 'REMOVE_CHARACTER':
      return {
        ...state,
        characters: state.characters.filter(c => c.id !== action.payload)
      };

    case 'SET_AUTO_CAST_CHARACTERS':
      return { ...state, autoCastCharacters: action.payload };

    case 'SET_GENERATED_IMAGE':
      return {
        ...state,
        generatedImages: {
          ...state.generatedImages,
          [action.payload.key]: action.payload.url
        }
      };

    case 'SET_LOADING':
      return { ...state, [action.payload.key]: action.payload.value };

    case 'SET_MODAL_IMAGE':
      return { ...state, modalImage: action.payload };

    case 'RESET':
      return { ...initialState, apiKey: state.apiKey };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
