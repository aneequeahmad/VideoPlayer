import EventManager from './EventManager';

let viewManager = null;
export const getViewManager = () => {
  if (!viewManager) {
    viewManager = new ViewManager();
  }
  return viewManager;
};

export const VIEW_MANAGER_EVENTS = {
  // Define events for the viewManager
  // These events can be used to manage audio streams
  VIEW_CHANGED: 'viewChanged',
  INITIALIZED: 'initialized',
};

export const APP_VIEWS = {
  DEFAULT: 'default',
  LOGIN_VIEW: 'Login',
  SETTINGS_VIEW: 'Settings',
  CAMERA_VIEW: 'Camera',
  RECORDINGS_VIEW: 'Recordings',
  EDITOR_VIEW: 'Editor',
};

class ViewManager extends EventManager {
  constructor() {
    super();
    this.init();
  }
  init = () => {
    this.currentView = {
      name: APP_VIEWS.DEFAULT,
      params: {},
    };
    this.viewDataStact = [];
    this.trigger(VIEW_MANAGER_EVENTS.INITIALIZED);
  };

  goBack = () => {
    let previewView = this.viewDataStact.pop();
    if (previewView) {
      this.changeView(previewView);
    }
  };
  pushView = (view, params) => {
    this.viewDataStact.push(this.currentView);
    let viewData = {
      name: view,
      params: params,
    };
    this.changeView(viewData);
  };
  changeView = (viewData) => {
    console.log('SETTING NEW VIEW === ', viewData);
    this.currentView = viewData;
    this.trigger(VIEW_MANAGER_EVENTS.VIEW_CHANGED);
  };
}
