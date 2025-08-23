import React, { useEffect, useState } from 'react';
import {
  getPlayerManager,
  PLAYER_MANAGER_EVENTS,
} from '../../Managers/PlayerManager';
import { FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa';

export const ButtonControls = ({}) => {
  const volumeRef = React.useRef(null);

  useEffect(() => {
    let playerManager = getPlayerManager();
    playerManager.on(PLAYER_MANAGER_EVENTS.VOLUME_CHANGE, onVolumeChange);
    return () => {
      playerManager.off(PLAYER_MANAGER_EVENTS.VOLUME_CHANGE, onVolumeChange);
    };
  }, []);

  const togglePlay = () => {
    const playerManager = getPlayerManager();
    const isPlaying = playerManager.isPlaying;
    playerManager.setIsPlaying(!isPlaying);
  };
  const setVolume = (event) => {
    const newVolume = event.target.value;
    const playerManager = getPlayerManager();
    playerManager.setVolume(newVolume);
  };

  const onVolumeChange = () => {
    let playerManager = getPlayerManager();
    let volume = playerManager.volume;
    if (volumeRef.current) {
      volumeRef.current.value = volume;
    }
  };
  const playerManager = getPlayerManager();
  const isPlaying = playerManager.isPlaying;

  return (
    <>
      <button style={styles.playBtn} onClick={togglePlay}>
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>
      <div style={styles.volumeControls}>
        <FaVolumeUp />
        <input
          ref={volumeRef}
          style={styles.volumeSlider}
          id="volumeControl"
          type="range"
          min="0"
          max="1"
          step="0.01"
          onChange={setVolume}
        />
      </div>
    </>
  );
};

const styles = {
  playBtn: {
    marginLeft: '10px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  volumeControls: {
    marginLeft: '1rem',
    width: '20%',
  },
  volumeSlider: {
    width: '80px',
    marginLeft: '10px',
  },
};
