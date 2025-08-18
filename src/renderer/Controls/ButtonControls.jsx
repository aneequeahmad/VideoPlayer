import React, { useEffect, useState } from 'react';
import { getPlayerManager, PLAYERMANAGER_EVENTS } from '../PlayerManager';
import { FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa';

export const ButtonControls = ({}) => {
  const volumeRef = React.useRef(null);
  const playerManager = getPlayerManager();

  useEffect(() => {
    let playerManager = getPlayerManager();
    playerManager.on(PLAYERMANAGER_EVENTS.VOLUME_CHANGE, onVolumeChange);
    return () => {
      playerManager.off(PLAYERMANAGER_EVENTS.VOLUME_CHANGE, onVolumeChange);
    };
  }, []);

  const togglePlay = () => {
    // if (playerRef.current) {
    //   const playerManager = getPlayerManager();
    const isPlaying = playerManager.isPlaying;
    playerManager.setIsPlaying(!isPlaying);
    // }
  };
  const setVolume = (event) => {
    const newVolume = event.target.value;
    // const playerManager = getPlayerManager();
    playerManager.setVolume(newVolume);
    // volumeRef.current.value = newVolume;
    // if (playerRef.current) {
    //   console.log('Setting volume to:', newVolume);
    //   playerRef.current.volume(newVolume);
    // }
  };

  const onVolumeChange = () => {
    let playerManager = getPlayerManager();
    let volume = playerManager.volume;
    if (volumeRef.current) {
      volumeRef.current.value = volume;
    }
  };
  const isPlaying = playerManager.isPlaying;

  return (
    <>
      <button
        onClick={togglePlay}
        style={{
          marginLeft: '10px',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>
      <div style={{ marginLeft: '1rem', width: '20%' }}>
        <FaVolumeUp />
        <input
          ref={volumeRef}
          style={{ width: '80px', marginLeft: '10px' }}
          id="volumeControl"
          type="range"
          min="0"
          max="1"
          step="0.01"
          //value={volume}
          onChange={setVolume}
        />
      </div>
    </>
  );
};
