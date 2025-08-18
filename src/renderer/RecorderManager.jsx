import EventManager from './EventManager';

let recorderManager = null;
export const getRecorderManager = () => {
  if (!recorderManager) {
    recorderManager = new RecorderManager();
  }
  return recorderManager;
};

export const RECORDERMANAGER_EVENTS = {
  // Define events for the RecorderManager
  // These events can be used to manage recording start/stop, etc.

  START_RECORDING: 'startRecording',
  STOP_RECORDING: 'stopRecording',
};

class RecorderManager extends EventManager {
  constructor() {
    super();

    this.audioRecorder = null;
    this.videoRecorder = null;
    this.audioChunks = [];
    this.videoChunks = [];
  }

  startRecording = (videoStream, audioStream) => {
    if (!videoStream || !audioStream) {
      console.error('Video or audio stream is not set.');
      return;
    }
    this.audioRecorder = new MediaRecorder(audioStream);
    this.videoRecorder = new MediaRecorder(videoStream);
    // To start recording:
    this.audioRecorder.start();
    this.videoRecorder.start();

    this.audioRecorder.ondataavailable = (event) => {
      this.audioChunks.push(event.data);
    };

    this.videoRecorder.ondataavailable = (event) => {
      this.videoChunks.push(event.data);
    };

    this.trigger(RECORDERMANAGER_EVENTS.START_RECORDING);
  };
  /**
   * Stops the recording and processes the recorded data.
   * This method will create blobs for both audio and video streams
   * and trigger the RECORD_STOP event.
   */
  stopRecording = () => {
    if (this.audioRecorder && this.videoRecorder) {
      this.audioRecorder.stop();
      this.videoRecorder.stop();

      this.audioRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        try {
          // Convert Blob to ArrayBuffer and then to a Uint8Array
          const arrayBuffer = await audioBlob.arrayBuffer();
          const buffer = new Uint8Array(arrayBuffer);
          const filename = `audio-${Date.now()}.webm`;

          // Call the secure function from the preload script
          const result = await window.electronAPI.saveBlob(buffer, filename);

          if (result.success) {
            alert(`File saved successfully to: ${result.filePath}`);
          } else {
            alert(`Failed to save file: ${result.error}`);
          }
        } catch (error) {
          console.error('Error saving file:', error);
          alert('An unexpected error occurred while saving the file.');
        }
        this.audioChunks = []; // Reset audio chunks for next recording
      };

      this.videoRecorder.onstop = async () => {
        const videoBlob = new Blob(this.videoChunks, { type: 'video/webm' });
        try {
          // Convert Blob to ArrayBuffer and then to a Uint8Array
          const arrayBuffer = await videoBlob.arrayBuffer();
          const buffer = new Uint8Array(arrayBuffer);
          const filename = `video-${Date.now()}.webm`;

          // Call the secure function from the preload script
          const result = await window.electronAPI.saveBlob(buffer, filename);

          if (result.success) {
            alert(`VIDEO File saved successfully to: ${result.filePath}`);
          } else {
            alert(`Failed to save file: ${result.error}`);
          }
        } catch (error) {
          console.error('Error saving file:', error);
          alert('An unexpected error occurred while saving the file.');
        }
        this.videoChunks = []; // Reset video chunks for next recording
      };
    }

    this.trigger(RECORDERMANAGER_EVENTS.STOP_RECORDING);
  };
}
