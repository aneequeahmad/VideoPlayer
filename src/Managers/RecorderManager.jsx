import EventManager from './EventManager';
import { getMicManager } from './MicManager';
import { getCameraManager } from './CameraManager';

let recorderManager = null;
export const getRecorderManager = () => {
  if (!recorderManager) {
    recorderManager = new RecordingManager();
  }
  return recorderManager;
};

export const RECORDING_STREAM_TYPES = {
  AUDIO: 'audio',
  VIDEO: 'video',
  AUDIO_VIDEO: 'audio_video',
};
export const RECORDING_MANAGER_EVENTS = {
  // Define events for the RecorderManager
  // These events can be used to manage recording start/stop, etc.

  START_RECORDING: 'startRecording',
  STOP_RECORDING: 'stopRecording',
};

class RecordingManager extends EventManager {
  constructor() {
    super();
    this.recorders = [];
  }

  initializeRecorder = (type) => {
    console.log('initializeRecorder >>>>>', type);
    if (type == RECORDING_STREAM_TYPES.AUDIO) {
      const micManager = getMicManager();
      let audioStream = micManager.getAudioStream();
      if (audioStream) {
        this.initializeStreamRecorder(audioStream, type, {
          mimeType: 'audio/webm',
        });
      } else {
        console.error('Audio stream is not available.');
      }
    } else if (type == RECORDING_STREAM_TYPES.VIDEO) {
      const cameraManager = getCameraManager();
      let videoStream = cameraManager.getVideoStream();
      if (videoStream) {
        this.initializeStreamRecorder(videoStream, type, {
          mimeType: 'video/mp4',
        });
      } else {
        console.error('Video stream is not available.');
      }
    } else if (type == RECORDING_STREAM_TYPES.AUDIO_VIDEO) {
      const micManager = getMicManager();
      const audioStream = micManager.getAudioStream();
      const cameraManager = getCameraManager();
      const videoStream = cameraManager.getVideoStream();
      if (audioStream && videoStream) {
        this.initializeStreamRecorder(audioStream, type, {
          mimeType: 'audio/webm',
        });
        this.initializeStreamRecorder(videoStream, type, {
          mimeType: 'video/mp4',
        });
      } else {
        console.error('Audio or Video stream is not available.');
      }
    }
  };
  initializeStreamRecorder = (stream, type, options) => {
    const recorder = new MediaRecorder(stream, options);
    const recorderObject = {
      type,
      recorder,
    };
    console.log('initializeStreamRecorder 111111', recorderObject);
    this.recorders.push(recorderObject);
  };
  startRecording = () => {
    for (let recorderObject of this.recorders) {
      this.startRecordingStream(recorderObject.type);
    }
    this.trigger(RECORDING_MANAGER_EVENTS.START_RECORDING);
  };
  startRecordingStream = (type) => {
    for (let recorderObject of this.recorders) {
      if (recorderObject.type === type) {
        console.log('Starting Recording >>>>>>>', recorderObject.recorder);
        recorderObject.recorder.start();
        recorderObject.recorder.ondataavailable = (event) => {
          console.log('Data Available >>>>>>>', event);
          this.onDataAvailable(recorderObject.recorder, event);
        };
        this.trigger(RECORDING_MANAGER_EVENTS.START_RECORDING, type);
      }
    }
  };

  // startRecording = (videoStream, audioStream) => {
  //   if (!videoStream || !audioStream) {
  //     console.error('Video or audio stream is not set.');
  //     return;
  //   }
  //   this.audioRecorder = new MediaRecorder(audioStream);
  //   this.videoRecorder = new MediaRecorder(videoStream);
  //   // To start recording:
  //   this.audioRecorder.start();
  //   this.videoRecorder.start();

  //   this.audioRecorder.ondataavailable = (event) => {
  //     this.audioChunks.push(event.data);
  //   };

  //   this.videoRecorder.ondataavailable = (event) => {
  //     this.videoChunks.push(event.data);
  //   };

  //   this.trigger(RECORDING_MANAGER_EVENTS.START_RECORDING);
  // };
  onDataAvailable = (recorder, event) => {
    if (event.data.size > 0) {
      for (let recorderObject of this.recorders) {
        if (recorderObject.recorder == recorder) {
          if (!recorderObject.chunks) {
            recorderObject.chunks = [];
          }
          recorderObject.chunks.push(event.data);
        }
      }
    }
  };

  /**
   * Stops the recording and processes the recorded data.
   * This method will create blobs for both audio and video streams
   * and trigger the RECORD_STOP event.
   */

  stopRecording = () => {
    for (let recorderObject of this.recorders) {
      this.stopRecordingStream(recorderObject.type);
    }
    this.trigger(RECORDING_MANAGER_EVENTS.STOP_RECORDING);
  };
  stopRecordingStream = (type) => {
    for (let recorderObject of this.recorders) {
      if (recorderObject.type === type) {
        console.log('Stopping Recording >>>>>>>', recorderObject.recorder);
        recorderObject.recorder.stop();
        recorderObject.recorder.onstop = () => {
          const blob = new Blob(recorderObject.chunks, {
            type: recorderObject.recorder.mimeType,
          });
          const fileName = `${type}.webm`;
          // Save the blob to a file
          this.saveBlob(blob, fileName);
          recorderObject.chunks = []; // Reset chunks for next recording
          console.log('Recording Stopped, Blob Created >>>>>>>', blob);
          // this.onStopRecordingStream(recorderObject);
        };
      }
    }
    // if (this.audioRecorder && this.videoRecorder) {
    //   this.audioRecorder.stop();
    //   this.videoRecorder.stop();

    //   this.audioRecorder.onstop = async () => {
    //     const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
    //     try {
    //       // Convert Blob to ArrayBuffer and then to a Uint8Array
    //       const arrayBuffer = await audioBlob.arrayBuffer();
    //       const buffer = new Uint8Array(arrayBuffer);
    //       const filename = `audio-${Date.now()}.webm`;

    //       // Call the secure function from the preload script
    //       const result = await window.electronAPI.saveBlob(buffer, filename);

    //       if (result.success) {
    //         alert(`File saved successfully to: ${result.filePath}`);
    //       } else {
    //         alert(`Failed to save file: ${result.error}`);
    //       }
    //     } catch (error) {
    //       console.error('Error saving file:', error);
    //       alert('An unexpected error occurred while saving the file.');
    //     }
    //     this.audioChunks = []; // Reset audio chunks for next recording
    //   };

    //   this.videoRecorder.onstop = async () => {
    //     const videoBlob = new Blob(this.videoChunks, { type: 'video/webm' });
    //     try {
    //       // Convert Blob to ArrayBuffer and then to a Uint8Array
    //       const arrayBuffer = await videoBlob.arrayBuffer();
    //       const buffer = new Uint8Array(arrayBuffer);
    //       const filename = `video-${Date.now()}.webm`;

    //       // Call the secure function from the preload script
    //       const result = await window.electronAPI.saveBlob(buffer, filename);

    //       if (result.success) {
    //         alert(`VIDEO File saved successfully to: ${result.filePath}`);
    //       } else {
    //         alert(`Failed to save file: ${result.error}`);
    //       }
    //     } catch (error) {
    //       console.error('Error saving file:', error);
    //       alert('An unexpected error occurred while saving the file.');
    //     }
    //     this.videoChunks = []; // Reset video chunks for next recording
    //   };
    // }

    // this.trigger(RECORDING_MANAGER_EVENTS.STOP_RECORDING);
  };
  saveBlob = async (blob, filename) => {
    try {
      // Convert Blob to ArrayBuffer and then to a Uint8Array
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      // Call the secure function from the preload script
      const result = await window.electronAPI.saveBlob(buffer, filename);
      // if (result.success) {
      //   alert(`File saved successfully to: ${result.filePath}`);
      // } else {
      //   alert(`Failed to save file: ${result.error}`);
      // }
    } catch (error) {
      console.error('Error saving file:', error);
      alert('An unexpected error occurred while saving the file.');
    }
  };
}
