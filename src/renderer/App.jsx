import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import VideoPlayerRapper from './VideoPlayerRapper';
import VideoRecorder from './VideoRecorder';
// import VideoManager from './RecorderManager';

const HomePage = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      <Link to="/video-player">
        <button className="homepage-btn">Video Editor</button>
      </Link>
      <Link to="/video-recorder">
        <button className="homepage-btn">Video Recorder</button>
      </Link>
      <Link to="/">
        <button className="homepage-btn">About us</button>
      </Link>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/video-player" element={<VideoPlayerRapper />} />
        <Route path="/video-recorder" element={<VideoRecorder />} />
      </Routes>
    </Router>
  );
}
