import React, { useRef, useState, useCallback, useEffect } from 'react';
import { getRecorderManager, RECORDERMANAGER_EVENTS } from './RecorderManager';
import { getCameraManager, CAMERAMANAGER_EVENTS } from './CameraManager';
import { getMicManager } from './MicManager';

export default function VideoRecorder() {
  const videoRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const cameraManager = getCameraManager();
  const micManager = getMicManager();
  const recorderManager = getRecorderManager();

  useEffect(() => {
    let cameraManager = getCameraManager();

    cameraManager.on(
      CAMERAMANAGER_EVENTS.VIDEO_STREAM_INITIALIZED,
      onVideoStreamUpdate,
    );
    return () => {
      cameraManager.off(
        CAMERAMANAGER_EVENTS.VIDEO_STREAM_INITIALIZED,
        onVideoStreamUpdate,
      );
    };
  }, []);

  const onStartVideo = () => {
    cameraManager.intialiseCamera();
    micManager.initialiseMic();
  };

  const onVideoStreamUpdate = () => {
    const videoStream = cameraManager.getVideoStream();
    console.log('ON VIDEO STREAM UDPATE **********', videoStream);
    if (videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
  };

  const onStartRecording = () => {
    const videoStream = cameraManager.getVideoStream();
    const audioStream = micManager.getAudioStream();
    console.log('ON START RECORDING **********', videoStream, audioStream);
    if (!videoStream || !audioStream) {
      console.error('Video or audio stream is not set.');
      return;
    }
    recorderManager.startRecording(videoStream, audioStream);
    setIsRecording(true);
  };

  const onStopRecording = () => {
    recorderManager.stopRecording();
    setIsRecording(false);
  };

  return (
    <>
      <div>
        <video
          ref={videoRef}
          autoPlay
          style={{ width: '600px', borderRadius: '10px' }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          marginTop: '20px',
        }}
      >
        <button className="homepage-btn" onClick={onStartVideo}>
          Start Video
        </button>
        {!isRecording ? (
          <button className="homepage-btn" onClick={onStartRecording}>
            Start Recording
          </button>
        ) : (
          <button className="homepage-btn" onClick={onStopRecording}>
            Stop Recording
          </button>
        )}
      </div>
    </>
  );
}
