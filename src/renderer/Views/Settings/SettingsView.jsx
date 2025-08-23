import React, { useRef, useState, useCallback, useEffect } from 'react';
import { getViewManager } from '../../../Managers/ViewManager';

export default function SettingsView() {
  return (
    <div>
      <div
        onClick={() => {
          const viewManager = getViewManager();
          viewManager.goBack();
        }}
      >
        Back
      </div>
      <div>SETTINGS</div>
    </div>
  );
}
