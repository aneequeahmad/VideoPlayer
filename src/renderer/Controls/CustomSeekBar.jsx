import React, { useState, useEffect } from 'react';
import {
  getPlayerManager,
  PLAYER_MANAGER_EVENTS,
} from '../../Managers/PlayerManager';
import { toHHMMSS } from '../../Utils';

const CustomSeekBar = ({}) => {
  const seekbarRef = React.useRef(null);
  const durationRef = React.useRef(null);

  const [totalDuration, setTotalDuration] = useState(0);
  useEffect(() => {
    let playerManager = getPlayerManager();
    playerManager.on(PLAYER_MANAGER_EVENTS.TIME_UPDATE, onTimeUpdate);
    playerManager.on(PLAYER_MANAGER_EVENTS.SEEK, onTimeUpdate);
    playerManager.on(PLAYER_MANAGER_EVENTS.DURATION_UPDATE, onDurationUpdate);

    return () => {
      playerManager.off(PLAYER_MANAGER_EVENTS.TIME_UPDATE, onTimeUpdate);
      playerManager.off(PLAYER_MANAGER_EVENTS.SEEK, onTimeUpdate);
      playerManager.off(
        PLAYER_MANAGER_EVENTS.DURATION_UPDATE,
        onDurationUpdate,
      );
    };
  }, []);

  const handleSeek = (event) => {
    const playerManager = getPlayerManager();
    playerManager.seekToTime(event.target.value);
  };

  const onDurationUpdate = (event) => {
    const playerManager = getPlayerManager();
    const duration = playerManager.totalDuration;
    setTotalDuration(duration);
    onTimeUpdate();
  };
  const onTimeUpdate = () => {
    const playerManager = getPlayerManager();
    const currentTime = playerManager.currentTime;
    const duration = playerManager.totalDuration;
    //console.log('onTimeUpdate called -- ', currentTime, totalDuration);
    seekbarRef.current.value = currentTime;
    durationRef.current.textContent = `${toHHMMSS(currentTime)} / ${toHHMMSS(duration)}`;
  };
  return (
    <>
      <div style={styles.seekBarContainer}>
        <input
          // id={'slider'}
          ref={seekbarRef}
          style={styles.seekBar}
          type="range"
          min="0"
          max={totalDuration}
          step="any" // Allow fractional steps for smoother seeking
          onChange={handleSeek}
          className="custom-seekbar"
        />
      </div>
      <div ref={durationRef} style={styles.durationText}></div>
    </>
  );
};

const styles = {
  seekBarContainer: {
    width: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekBar: {
    width: '100%',
    // height: '5px',
    // backgroundColor: '#ddd',
    // borderRadius: '5px',
    // outline: 'none',
  },
  durationText: {
    marginLeft: '10px',
    color: 'black',
    opacity: '0.5',
    fontSize: '12px',
  },
};
export default CustomSeekBar;
