import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
// import { FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa';
// import { MdFullscreen } from "react-icons/md";
import CustomSeekBar from '../../Controls/CustomSeekBar';
import {
  getPlayerManager,
  PLAYER_MANAGER_EVENTS,
} from '../../../Managers/PlayerManager';
import { ButtonControls } from '../../Controls/ButtonControls';

export const VideoPlayer = ({ options, onReady, src, onCrossBtnClick }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const dataRef = useRef({});

  useEffect(() => {
    let playerManager = getPlayerManager();
    playerManager.on(PLAYER_MANAGER_EVENTS.PLAY, onPlay);
    playerManager.on(PLAYER_MANAGER_EVENTS.PAUSE, onPause);
    playerManager.on(PLAYER_MANAGER_EVENTS.SEEK, currentTimeChange);
    playerManager.on(PLAYER_MANAGER_EVENTS.VOLUME_CHANGE, onVolumeChange);
    return () => {
      playerManager.off(PLAYER_MANAGER_EVENTS.PLAY, onPlay);
      playerManager.off(PLAYER_MANAGER_EVENTS.PAUSE, onPause);
      playerManager.off(PLAYER_MANAGER_EVENTS.SEEK, currentTimeChange);
      playerManager.off(PLAYER_MANAGER_EVENTS.VOLUME_CHANGE, onVolumeChange);
    };
  }, []);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement('video-js');

      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const options = {
        responsive: true,
        fluid: true,
        sources: [
          {
            src,
            type: 'video/mp4',
          },
        ],
      };
      const player = videojs(videoElement, options, () => {
        videojs.log('player is ready');
        onReady && onReady(player);
      });
      player.on('loadeddata', onLoaded);
      playerRef.current = player;
      // You could update an existing player in the `else` block here
      // on prop change, for example:
    } else {
      playerRef.current.src(src);
    }
  }, [src, videoRef]);

  const onLoaded = () => {
    const playerManager = getPlayerManager();
    playerManager.setTotalDuration(playerRef.current.duration());
  };
  // Dispose the Video.js player when the functional component unmounts
  useEffect(() => {
    const player = playerRef.current;
    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  const onPlay = () => {
    playerRef.current.play();
    setIsPlaying(true);
    if (!dataRef.current.updateInterval) {
      dataRef.current.updateInterval = setInterval(() => {
        // console.log('Updating current time...');
        const playerManager = getPlayerManager();
        playerRef.current &&
          playerManager.setCurrentTime(playerRef.current.currentTime());
      }, 40);
    }
  };
  const onPause = () => {
    playerRef.current.pause();
    setIsPlaying(false);
    clearInterval(dataRef.current.updateInterval);
    dataRef.current.updateInterval = null;
  };
  const currentTimeChange = () => {
    const playerManager = getPlayerManager();
    const currentTime = playerManager.currentTime;
    playerRef.current.currentTime(currentTime);
  };
  const onVolumeChange = () => {
    const playerManager = getPlayerManager();
    const volume = playerManager.volume;
    if (playerRef.current) {
      playerRef.current.volume(volume);
    }
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div data-vjs-player>
        <div ref={videoRef}></div>
      </div>
      <div style={styles.crossBtn} onClick={() => onCrossBtnClick(src)}>
        x
      </div>
    </div>
  );
};

export default VideoPlayer;

const styles = {
  crossBtn: {
    position: 'absolute',
    top: '0',
    right: '0',
    width: '20px',
    textAlign: 'center',
    borderRadius: '50%',
    backgroundColor: 'white',
    cursor: 'pointer',
  },
  // controlsContainer: {
  //   position: 'absolute',
  //   display: 'flex',
  //   zIndex: '100',
  //   height: '2rem',
  //   bottom: '0',
  //   width: '100%',
  //   backgroundColor: 'white',
  //   display: 'flex',
  //   alignItems: 'center',
  //   width: '100%',
  // },
};
