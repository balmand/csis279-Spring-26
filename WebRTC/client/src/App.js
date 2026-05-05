import './App.css';
import VideoChat from './Pages/videocall/VideoChat';
import { ContextProvider } from './context/Context';

function App() {
  return (
    <div className="App">
      <ContextProvider>
        <VideoChat />
      </ContextProvider>
    </div>
  );
}

export default App;
