import { AppProvider } from './context/AppContext';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import Modal from './components/Modal';

function App() {
  return (
    <AppProvider>
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        <LeftPanel />
        <RightPanel />
        <Modal />
      </div>
    </AppProvider>
  );
}

export default App;
