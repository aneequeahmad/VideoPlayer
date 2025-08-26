import React from 'react';
import { getViewManager } from '../../Managers/ViewManager';

export default function BackButton() {
  const onBackBtnClick = () => {
    const viewManager = getViewManager();
    viewManager.goBack();
  };

  return (
    <div onClick={onBackBtnClick} style={styles.backBtn}>
      Back
    </div>
  );
}

const styles = {
  backBtn: {
    position: 'absolute',
    width: '40px',
    backgroundColor: 'white',
    top: '1rem',
    left: '10px',
    fontSize: '18px',
    padding: '5px',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};
