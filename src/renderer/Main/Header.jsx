import React from 'react';
import { APP_VIEWS, getViewManager } from '../../Managers/ViewManager';
export default function Header() {
  const changeView = (view) => {
    let viewManager = getViewManager();
    viewManager.pushView(view);
  };
  return (
    <div style={styles.appHeader}>
      <button
        style={styles.headerBtn}
        onClick={() => changeView(APP_VIEWS.LOGIN_VIEW)}
      >
        Login
      </button>
      <button
        style={styles.headerBtn}
        onClick={() => changeView(APP_VIEWS.SETTINGS_VIEW)}
      >
        Settings
      </button>
    </div>
  );
}

const styles = {
  appHeader: {
    width: '100%',
    padding: '8px 0',
    background: '#000',
    color: 'white',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  headerBtn: {
    padding: '10px',
    color: 'white',
    backgroundColor: '#7a2c9e',
    borderColor: 'transparent',
    borderRadius: '5px',
    '&:hover': {
      cursor: 'pointer',
    },
    margin: '0 10px',
  },
};
