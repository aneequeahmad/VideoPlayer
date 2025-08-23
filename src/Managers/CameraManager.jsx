import EventManager from './EventManager';

let cameraManager = null;
export const getCameraManager = () => {
  if (!cameraManager) {
    cameraManager = new CameraManager();
  }
  return cameraManager;
};

export const CAMERA_MANAGER_EVENTS = {
  // Define events for the CameraManager
  // These events can be used to manage video streams

  VIDEO_STREAM_INITIALIZED: 'videoStreamInitialized',
  CAMERA_INITIALIZED: 'cameraInitialized',
};

class CameraManager extends EventManager {
  constructor() {
    super();
    this.init();
  }

  init = () => {
    this.videoStream = null;
    this.allCameras = [];
    this.intialiseCamera();
    this.trigger(CAMERA_MANAGER_EVENTS.CAMERA_INITIALIZED);
  };

  intialiseCamera = async (id) => {
    console.log('Intialising Camera with ID:', id);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          width: 1280,
          height: 720,
          frameRate: 30,
          deviceId: id ? { exact: id } : undefined,
        },
      });
      this.videoStream = stream;
    } catch (err) {
      console.error('Error accessing media devices.', err);
    }
    this.trigger(CAMERA_MANAGER_EVENTS.VIDEO_STREAM_INITIALIZED);
  };
  getAllCameras = () => {
    //
    if (!this.allCameras.length) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        this.allCameras = devices.filter(
          (device) => device.kind === 'videoinput',
        );
      });
    }
    return this.allCameras;
  };

  getVideoStream = () => {
    return this.videoStream;
  };
}
