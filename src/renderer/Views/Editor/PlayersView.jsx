import React, { useEffect, useRef, useState } from 'react';
import 'video.js/dist/video-js.css';
import CustomSeekBar from '../../Controls/CustomSeekBar';
import {
  getPlayerManager,
  PLAYER_MANAGER_EVENTS,
} from '../../../Managers/PlayerManager';
import { ButtonControls } from '../../Controls/ButtonControls';
import VideoPlayer from './VideoPlayer';

export const PlayersView = ({ videos }) => {
  const [playingVideos, setPlayingVideos] = useState([]);
  // const prevVideosRef = useRef([]);
  const playerManagerRef = useRef(null);

  useEffect(() => {
    const playerManager = getPlayerManager();
    playerManagerRef.current = playerManager;

    playerManager.on(PLAYER_MANAGER_EVENTS.VIDEOS_CHANGED, onVideosUpdated);

    // Initial sync
    onVideosUpdated();

    return () => {
      playerManager.off(PLAYER_MANAGER_EVENTS.VIDEOS_CHANGED, onVideosUpdated);
    };
  }, []);

  useEffect(() => {
    if (!videos || !playerManagerRef.current) return;

    const playerManager = playerManagerRef.current;

    // Find videos to add (new in current props, not in manager)
    const videosToAdd = videos.filter(
      (video) => !playerManager.videos.includes(video.videoUrl),
    );

    // Find videos to remove (in manager but not in current props)
    const videosToRemove = playerManager.videos.filter(
      (videoUrl) => !videos.some((video) => video.videoUrl === videoUrl),
    );

    // Add new videos
    videosToAdd.forEach((video) => {
      playerManager.addVideo(video.videoUrl);
    });

    // Update ref for next comparison
    // prevVideosRef.current = videos;
  }, [videos]); // This effect runs whenever videos prop changes

  const onVideosUpdated = () => {
    const playerManager = playerManagerRef.current;
    if (playerManager) {
      setPlayingVideos([...playerManager.videos]); // Create new array to trigger re-render
    }
  };

  const onExportBtnClick = async () => {
    const playingPaths = videos
      .filter((v) => playingVideos.includes(v.videoUrl))
      .map((v) => v.path);
    console.log('VIDEOS ARE >>>>', playingPaths);
    const mergedVideo = await window.ffmpegAPI.mergeVideosSideBySide({
      videoPaths: playingPaths,
    });
    console.log('MERGED VIDEO IS >>>', mergedVideo);
    const fileName = `MergedVideo.mp4`;
    const result = await window.electronAPI.saveBlob(
      mergedVideo.buffer,
      fileName,
    );
    if (result.success) {
      console.log('SAVE FILE AT PATH >>>>>', result.filePath);
    }
  };

  return (
    <>
      <div style={styles.playerViewContainer}>
        <div style={{ display: 'flex' }}>
          {playingVideos &&
            playingVideos.map((videoUrl) => {
              return <VideoPlayer key={videoUrl} src={videoUrl} />;
            })}
        </div>

        {!!playingVideos.length ? (
          <div style={styles.controlsContainer}>
            <ButtonControls />
            <CustomSeekBar />
          </div>
        ) : null}
        {playingVideos.length ? (
          <div style={styles.exportBtn} onClick={onExportBtnClick}>
            Export
          </div>
        ) : null}
      </div>
    </>
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
  exportBtn: {
    padding: '10px',
    backgroundColor: 'white',
    marginTop: '3rem',
    width: '100px',
    cursor: 'pointer',
    textAlign: 'center',
  },
};
