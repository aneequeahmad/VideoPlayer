import React, { useEffect, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
// import { FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa';
// import { MdFullscreen } from "react-icons/md";
import CustomSeekBar from './Controls/CustomSeekBar';
import { getPlayerManager, PLAYERMANAGER_EVENTS } from './PlayerManager';
import { ButtonControls } from './Controls/ButtonControls';

export const VideoJS = (props) => {
  const videoRef = React.useRef(null);
  const playerRef = React.useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { options, onReady } = props;

  const dataRef = React.useRef({});

  useEffect(() => {
    let playerManager = getPlayerManager();
    playerManager.on(PLAYERMANAGER_EVENTS.PLAY, onPlay);
    playerManager.on(PLAYERMANAGER_EVENTS.PAUSE, onPause);
    playerManager.on(PLAYERMANAGER_EVENTS.SEEK, currentTimeChange);
    playerManager.on(PLAYERMANAGER_EVENTS.VOLUME_CHANGE, onVolumeChange);
    return () => {
      playerManager.off(PLAYERMANAGER_EVENTS.PLAY, onPlay);
      playerManager.off(PLAYERMANAGER_EVENTS.PAUSE, onPause);
      playerManager.off(PLAYERMANAGER_EVENTS.SEEK, currentTimeChange);
      playerManager.off(PLAYERMANAGER_EVENTS.VOLUME_CHANGE, onVolumeChange);
    };
  }, []);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement('video-js');

      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const player = videojs(videoElement, options, () => {
        videojs.log('player is ready');
        onReady && onReady(player);
      });
      player.on('loadeddata', onLoaded);
      playerRef.current = player;
      // You could update an existing player in the `else` block here
      // on prop change, for example:
    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [options, videoRef]);

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
    console.log('Player is playing');
    if (!dataRef.current.updateInterval) {
      dataRef.current.updateInterval = setInterval(() => {
        // console.log('Updating current time...');
        const playerManager = getPlayerManager();
        playerManager.setCurrentTime(playerRef.current.currentTime());
      }, 40);
    }
  };
  const onPause = () => {
    playerRef.current.pause();
    setIsPlaying(false);
    console.log('Player is paused');
    clearInterval(dataRef.current.updateInterval);
    dataRef.current.updateInterval = null;
  };
  const currentTimeChange = () => {
    const playerManager = getPlayerManager();
    const currentTime = playerManager.currentTime;
    playerRef.current.currentTime(currentTime);
    // console.log('Current time updated:', currentTime);
  };
  const onVolumeChange = () => {
    const playerManager = getPlayerManager();
    const volume = playerManager.volume;
    if (playerRef.current) {
      playerRef.current.volume(volume);
      // console.log('Volume updated:', volume);
    }
  };

  console.log('RENDERING VIDEO PLAYER AGAIN >>>>> ');

  return (
    <div data-vjs-player>
      <div ref={videoRef} style={{ position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            zIndex: 100,
            height: '2rem',
            bottom: 0,
            width: '100%',
            backgroundColor: 'white',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', width: `100%` }}>
            <ButtonControls />
            {playerRef.current && <CustomSeekBar />}
            {/* {playerRef.current && <MdFullscreen onClick={onFullScreenClick} />} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoJS;
