import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  getRecorderManager,
  RECORDING_STREAM_TYPES,
} from '../../../Managers/RecorderManager';
import {
  getCameraManager,
  CAMERA_MANAGER_EVENTS,
} from '../../../Managers/CameraManager';
import { getMicManager } from '../../../Managers/MicManager';
import { getViewManager } from '../../../Managers/ViewManager';
import BackButton from '../../Components/BackButton';
import { toHHMMSS } from '../../../Utils';

export default function CameraView(params) {
  const videoRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [timerInterval, setTimerInterval] = useState(null);
  const durationRef = useRef(null);

  console.log(' rendered VideoRecorder --- ', params);
  useEffect(() => {
    let cameraManager = getCameraManager();
    let micManager = getMicManager();
    cameraManager.on(
      CAMERA_MANAGER_EVENTS.VIDEO_STREAM_INITIALIZED,
      onVideoStreamUpdate,
    );
    return () => {
      cameraManager.off(
        CAMERA_MANAGER_EVENTS.VIDEO_STREAM_INITIALIZED,
        onVideoStreamUpdate,
      );
    };
  }, []);

  const onVideoStreamUpdate = () => {
    let cameraManager = getCameraManager();
    const videoStream = cameraManager.getVideoStream();
    console.log('ON VIDEO STREAM UDPATE **********', videoStream);
    if (videoRef.current) {
      videoRef.current.srcObject = videoStream;
    }
  };
  const onStartRecording = () => {
    let recorderManager = getRecorderManager();
    recorderManager.initializeRecorder(RECORDING_STREAM_TYPES.AUDIO);
    recorderManager.initializeRecorder(RECORDING_STREAM_TYPES.VIDEO);
    recorderManager.startRecording();
    setIsRecording(true);
    let startTime = Date.now();
    const timerInterval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      console.log(`Recording time: ${elapsedSeconds} seconds`);
      durationRef.current.textContent = `${toHHMMSS(elapsedSeconds)}`;
    }, 1000);
    setTimerInterval(timerInterval);

    // Store interval and startTime in state for cleanup and display if needed
  };

  const onStopRecording = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    let recorderManager = getRecorderManager();
    recorderManager.stopRecording();
    setIsRecording(false);
  };

  return (
    <>
      <BackButton />
      <div style={styles.cameraViewContainer}>
        <div style={styles.videoViewContainer}>
          <video ref={videoRef} autoPlay style={styles.videoView} />
          {!isRecording ? (
            <button style={styles.recordingBtn} onClick={onStartRecording}>
              Start Recording
            </button>
          ) : (
            <button style={styles.recordingBtn} onClick={onStopRecording}>
              Stop Recording
            </button>
          )}
        </div>
        {isRecording && (
          <div ref={durationRef} style={styles.durationText}></div>
        )}
      </div>
    </>
  );
}

const styles = {
  recordingBtn: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  cameraViewContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoViewContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    alignItems: 'center',
  },
  videoView: { width: '600px', borderRadius: '10px' },
  durationText: {
    marginLeft: '10px',
    color: 'white',
    width: '50px',
    backgroundColor: 'red',
    padding: '5px',
    borderRadius: '5px',
    textAlign: 'center',
    marginTop: '10px',
  },
};
