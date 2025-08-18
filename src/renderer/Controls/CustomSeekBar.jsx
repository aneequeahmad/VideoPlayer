import React, { useState, useEffect } from 'react';
import { getPlayerManager, PLAYERMANAGER_EVENTS } from '../PlayerManager';

const CustomSeekBar = ({}) => {
  const seekbarRef = React.useRef(null);
  const durationRef = React.useRef(null);

  const [totalDuration, setTotalDuration] = useState(0);
  useEffect(() => {
    let playerManager = getPlayerManager();
    playerManager.on(PLAYERMANAGER_EVENTS.TIME_UPDATE, onTimeUpdate);
    playerManager.on(PLAYERMANAGER_EVENTS.SEEK, onTimeUpdate);
    playerManager.on(PLAYERMANAGER_EVENTS.DURATION_UPDATE, onDurationUpdate);

    return () => {
      playerManager.off(PLAYERMANAGER_EVENTS.TIME_UPDATE, onTimeUpdate);
      playerManager.off(PLAYERMANAGER_EVENTS.SEEK, onTimeUpdate);
      playerManager.off(PLAYERMANAGER_EVENTS.DURATION_UPDATE, onDurationUpdate);
    };
  }, []);

  const handleSeek = (event) => {
    const playerManager = getPlayerManager();
    playerManager.seekToTime(event.target.value);
  };
  const toHHMMSS = (secs) => {
    var sec_num = parseInt(secs, 10);
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor(sec_num / 60) % 60;
    var seconds = sec_num % 60;

    return [hours, minutes, seconds]
      .map((v) => (v < 10 ? '0' + v : v))
      .filter((v, i) => v !== '00' || i > 0)
      .join(':');
  };
  // console.log('Current Time >>>>>', currentTime, 'Duration:', duration);

  const onDurationUpdate = (event) => {
    const playerManager = getPlayerManager();
    const duration = playerManager.totalDuration;
    setTotalDuration(duration);
    onTimeUpdate();
  };
  const onTimeUpdate = () => {
    const playerManager = getPlayerManager();
    const currentTime = playerManager.currentTime;
    const totalDuration = playerManager.totalDuration;
    //console.log('onTimeUpdate called -- ', currentTime, totalDuration);
    seekbarRef.current.value = currentTime;
    durationRef.current.textContent = `${toHHMMSS(currentTime)} / ${toHHMMSS(totalDuration)}`;
  };
  return (
    <>
      <div className="custom-seekbar-container" style={{ width: '50%' }}>
        <input
          // id={'slider'}
          ref={seekbarRef}
          style={{ width: '100%', transform: 'transition ' }}
          type="range"
          min="0"
          max={totalDuration}
          step="any" // Allow fractional steps for smoother seeking
          onChange={handleSeek}
          className="custom-seekbar"
        />
      </div>
      <div
        ref={durationRef}
        style={{ marginLeft: '10px', color: 'black', opacity: '0.5' }}
      ></div>
    </>
  );
};

export default CustomSeekBar;
