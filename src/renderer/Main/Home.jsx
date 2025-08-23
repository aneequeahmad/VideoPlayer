// import { useEffect, useState } from 'react';
// import Header from './Header';
// import { APP_VIEWS, getViewManager } from '../../Managers/ViewManager';
// import CameraView from '../Views/Camera/CameraView';
// import EditorView from '../Views/Editor/EditorView';
// import RecordingsView from '../Views/Recordings/RecordingsView';

// const Home = () => {
//   const [currentView, setCurrentView] = useState();
//   useEffect(() => {
//     onViewChanged();
//   }, []);

//   const onViewChanged = () => {
//     let viewManager = getViewManager();
//     setCurrentView(viewManager.currentView);
//   };

//   return (
//     <>
//       <Header />
//       <div
//         style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//         }}
//       >
//         {currentView == APP_VIEWS.CAMERA_VIEW && <CameraView />}
//         {currentView == APP_VIEWS.EDITOR_VIEW && <EditorView />}
//         {currentView == APP_VIEWS.RECORDINGS_VIEW && <RecordingsView />}
//         {Object.values(APP_VIEWS).map((view) => {
//           <ViewButton view={view} />;
//         })}
//       </div>
//     </>
//   );
// };

// const ViewButton = ({ view }) => {
//   const changeView = (view) => {
//     let viewManager = getViewManager();
//     viewManager.changeView(view);
//   };
//   return (
//     <button onClick={() => changeView(view)} className="homepage-btn">
//       {view}
//     </button>
//   );
// };

// export default Home;
