/**
 * PlayerManager class-based event manager.
 * Provides on, off, and trigger methods for event handling.
 */

import EventManager from './EventManager';

let playerManager = null;
export const getPlayerManager = () => {
  if (!playerManager) {
    playerManager = new PlayerManager();
  }
  return playerManager;
};

export const PLAYERMANAGER_EVENTS = {
  PLAY: 'play',
  PAUSE: 'pause',
  VOLUME_CHANGE: 'volumeChange',
  TIME_UPDATE: 'timeUpdate',
  DURATION_UPDATE: 'timeUpdate',
  SEEK: 'seek',
};

class PlayerManager extends EventManager {
  constructor() {
    super();

    this.isPlaying = false; // Track the playing state
    this.currentTime = 0; // Track the current time
    this.volume = 0; // Track the volume level

    this.setIsPlaying = this.setIsPlaying.bind(this);
    this.setVolume = this.setVolume.bind(this);
    this.setCurrentTime = this.setCurrentTime.bind(this);
  }

  setTotalDuration(value) {
    this.totalDuration = value;
    this.trigger(PLAYERMANAGER_EVENTS.DURATION_UPDATE);
  }
  setIsPlaying(value) {
    this.isPlaying = value;
    if (value) {
      this.trigger(PLAYERMANAGER_EVENTS.PLAY);
    } else {
      this.trigger(PLAYERMANAGER_EVENTS.PAUSE);
    }
  }

  setVolume(value) {
    this.volume = value;
    console.log('Volume Updated >>>>>>>', value);
    this.trigger(PLAYERMANAGER_EVENTS.VOLUME_CHANGE);
  }

  setCurrentTime(value) {
    this.currentTime = value;
    // console.log('Current Time Updated:', value);
    this.trigger(PLAYERMANAGER_EVENTS.TIME_UPDATE);
  }
  seekToTime(value) {
    this.currentTime = value;
    console.log('Current Time Updated:', value);
    this.trigger(PLAYERMANAGER_EVENTS.SEEK);
  }
}
