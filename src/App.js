import './App.css';
import Metronome from './components/Metronome';

function App() {
  return (
    <div className="App">
      <header>
        <h1>Metronome Web App</h1>
      </header>
      <div>
        <Metronome  className="flex" />
      </div>
    </div>
  );
}

export default App;
