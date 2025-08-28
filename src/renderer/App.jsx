import React, { useEffect, useState } from 'react';
import {
  APP_VIEWS,
  getViewManager,
  VIEW_MANAGER_EVENTS,
} from '../Managers/ViewManager';
import Header from './Main/Header';
import CameraView from './Views/Camera/CameraView';
import EditorView from './Views/Editor/EditorView';
import RecordingsView from './Views/Recordings/RecordingsView';
import LoginView from './Views/Login/LoginView';
import SettingsView from './Views/Settings/SettingsView';
import './App.css';

export default function App() {
  const [currentView, setCurrentView] = useState(null);
  useEffect(() => {
    let viewManager = getViewManager();
    viewManager.on(VIEW_MANAGER_EVENTS.VIEW_CHANGED, onViewChanged);
    onViewChanged();
    return () => {
      viewManager.off(VIEW_MANAGER_EVENTS.VIEW_CHANGED, onViewChanged);
    };
  }, []);

  const onViewChanged = () => {
    let viewManager = getViewManager();
    setCurrentView(viewManager.currentView);
  };

  return !!currentView ? (
    <div>
      <Header />
      <div>
        {currentView.name == APP_VIEWS.CAMERA_VIEW && (
          <CameraView {...currentView.params} />
        )}
        {currentView.name == APP_VIEWS.EDITOR_VIEW && <EditorView />}
        {currentView.name == APP_VIEWS.RECORDINGS_VIEW && <RecordingsView />}
        {currentView.name == APP_VIEWS.LOGIN_VIEW && <LoginView />}
        {currentView.name == APP_VIEWS.SETTINGS_VIEW && <SettingsView />}
        {currentView.name == APP_VIEWS.DEFAULT && (
          <div style={styles.viewBtnsContainer}>
            {Object.values(APP_VIEWS).map((view) => {
              return <ViewButton view={view} />;
            })}
          </div>
        )}
      </div>
    </div>
  ) : null;
}
const ViewButton = ({ view }) => {
  const changeView = (view) => {
    let viewManager = getViewManager();
    viewManager.pushView(view, { someData: 'data' });
  };
  return (
    <button style={styles.viewBtn} onClick={() => changeView(view)}>
      {view}
    </button>
  );
};

const styles = {
  viewBtnsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewBtn: {
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
