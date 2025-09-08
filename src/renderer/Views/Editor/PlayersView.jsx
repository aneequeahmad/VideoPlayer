import React, { useEffect, useRef, useState } from 'react';
import 'video.js/dist/video-js.css';
// import { FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa';
// import { MdFullscreen } from "react-icons/md";
import CustomSeekBar from '../../Controls/CustomSeekBar';
import {
  getPlayerManager,
  PLAYER_MANAGER_EVENTS,
} from '../../../Managers/PlayerManager';
import { ButtonControls } from '../../Controls/ButtonControls';
import VideoPlayer from './VideoPlayer';

export const PlayersView = ({ videos }) => {
  const [playingVideos, setPlayingVideos] = useState([]);
  const prevVideosRef = useRef([]);
  useEffect(() => {
    const playerManager = getPlayerManager();
    playerManager.on(PLAYER_MANAGER_EVENTS.VIDEOS_CHANGED, onVideosUpdated);

    if (videos) {
      const prevVideos = prevVideosRef.current;
      //const prevVideos = playerManager.videos;

      // Find videos that are new compared to last render
      const newVideos = videos.filter(
        (video) => !prevVideos.some((v) => v.videoUrl === video.videoUrl),
      );
      console.log('NEW VIDEOS ARE >>>>', newVideos);
      newVideos.forEach((video) => {
        playerManager.addVideo(video.videoUrl);
      });

      // Update ref so we know what was added last time
      prevVideosRef.current = videos;
    }

    return () => {
      playerManager.off(PLAYER_MANAGER_EVENTS.VIDEOS_CHANGED, onVideosUpdated);
    };
  }, [videos]);

  const onVideosUpdated = () => {
    let playerManager = getPlayerManager();
    console.log('VIDEOS IN PLAYER MANAGEr >>>>>', playerManager.videos);
    setPlayingVideos(playerManager.videos);
  };

  return (
    <div style={styles.playerViewContainer}>
      <div style={{ display: 'flex' }}>
        {playingVideos &&
          playingVideos.map((video) => {
            return <VideoPlayer src={video} />;
          })}
      </div>

      <div style={styles.controlsContainer}>
        <ButtonControls />
        <CustomSeekBar />
      </div>
    </div>
  );
};

export default PlayersView;

const styles = {
  playerViewContainer: {
    width: '600px',
    marginLeft: '2rem',
    position: 'relative',
  },
  controlsContainer: {
    position: 'absolute',
    display: 'flex',
    zIndex: '100',
    height: '2rem',
    width: '100%',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
};
