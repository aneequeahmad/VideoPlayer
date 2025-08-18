import EventManager from './EventManager';

let micManager = null;
export const getMicManager = () => {
  if (!micManager) {
    micManager = new MicManager();
  }
  return micManager;
};

export const MICMANAGER_EVENTS = {
  // Define events for the MicManager
  // These events can be used to manage audio streams
  AUDIO_STREAM_INITIALIZED: 'audioStreamInitialized',
  MIC_INITIALIZED: 'micInitialized',
};

class MicManager extends EventManager {
  constructor() {
    super();
    this.init();
  }
  init = () => {
    this.audioStream = null;
    this.initialiseMic();
    this.trigger(MICMANAGER_EVENTS.MIC_INITIALIZED);
  };

  initialiseMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      this.audioStream = stream;
    } catch (err) {
      console.error('Error accessing media devices.', err);
    }
    this.trigger(MICMANAGER_EVENTS.AUDIO_STREAM_INITIALIZED);
  };

  getAudioStream = () => {
    return this.audioStream;
  };
}
