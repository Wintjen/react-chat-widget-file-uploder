import React, { useEffect, useMemo, useState } from 'react';

import { TFile, useUploadFiles } from './hooks';
const send = require('../../../../../../../assets/clip.svg') as string;
const capture = require('../../../../../../../assets/video-camera-record-camera-movie-svgrepo-com.svg') as string;
const screenRecordIcon = require('../../../../../../../assets/screen-alt-svgrepo-com.svg') as string;
const startRecordingIcon = require('../../../../../../../assets/start-recording.svg') as string;
const stopRecordingIcon = require('../../../../../../../assets/stop-recording.svg') as string;
const trashIcon = require('../../../../../../../assets/trash.svg') as string;
const acceptIcon = require('../../../../../../../assets/accept.svg') as string;
const minusIcon = require('../../../../../../../assets/close.svg') as string;
import './style.scss';
import Webcam from './webcam'
import ReactModal from 'react-modal'
import { ReactMediaRecorder } from 'react-media-recorder'
import { Tooltip } from 'react-tooltip';
import { GlobalState } from '@types';
import { useSelector } from 'react-redux';

ReactModal.setAppElement('#root');

type Props = {
  onClick: (e: any) => void;
  screenRecording: boolean;
  setScreenRecording: (e: boolean) => void;
};

const getSupportedMimeType = () => {
  const possibleTypes = [
    'video/webm;codecs=h264',
    'video/webm',
    'video/mp4',
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8'
  ];
  
  return possibleTypes.find(type => {
    return MediaRecorder.isTypeSupported(type);
  }) || '';
};

export const FileUpload: React.FC<Props> = ({ onClick, screenRecording, setScreenRecording }) => {
  const [files, selectFiles, deleteFile, handleBlob] = useUploadFiles();
  const [width, setWidth] = useState<number>(window.innerWidth);
  const [isOpen, setIsOpen] = useState(false)
  const [blob, setBlob] = useState<Blob>();
  const [shouldInitializeWebcam, setShouldInitializeWebcam] = useState(false)
  
  function handleWindowSizeChange() {
      setWidth(window.innerWidth);
  }
  useEffect(() => {
      window.addEventListener('resize', handleWindowSizeChange);
      return () => {
          window.removeEventListener('resize', handleWindowSizeChange);
      }
  }, []);

  const isMobile = width <= 768;

  
  useEffect(() => {
    if (files.length) {
      onClick(files);
    }
  }, [files]);

  useEffect(() => {
    if(blob) {
      handleBlob(blob)
    }
  }, [blob])

  const updateOpen = () => {
    setIsOpen(!isOpen)
  }

  const acceptScreenRecording = (mediaBlobUrl: string) => {
    fetch(mediaBlobUrl)
      .then(response => response.blob())
      .then(blob => {
        const mimeType = blob.type || 'video/mp4';
        const videoBlob = new Blob([blob], { type: mimeType });
        handleBlob(videoBlob);
      })
      .catch(error => {
        console.error('Error processing video:', error);
      });
    setScreenRecording(false);
  };

  const forcedScreenRecorder = useSelector((state: GlobalState) => state.behavior.forcedScreenRecorder);

  console.log('forcedScreenRecorder', forcedScreenRecorder);

  const canShowMediaUpload = useMemo(() => {
    return !forcedScreenRecorder;
  }, [forcedScreenRecorder]);
  const canShowCamera = useMemo(() => {
    return !forcedScreenRecorder;
  }, [forcedScreenRecorder]);

  return (
    <>
      <ReactModal
        isOpen={isOpen}
        ariaHideApp={false}
        style={{
          overlay: {
              zIndex: 9999999999,
          },
          content: {
            width: 600,
            height: 350,
            margin: 'auto'
          }
        }}
      >
        <div className="webcam" style={{width: 600, height: 315, margin: 'auto'}}>
          <Webcam setBlob={setBlob} setIsOpen={updateOpen} shouldInitializeWebcam={shouldInitializeWebcam} setShouldInitializeWebcam={setShouldInitializeWebcam}/>
        </div>
      </ReactModal>

      <ReactModal
        isOpen={screenRecording}
        ariaHideApp={false}
        style={{
          overlay: {
              zIndex: 9999999999,
          },
        }}
      >
        <div className="screen-recorder-container">
          <ReactMediaRecorder
            screen
            mediaRecorderOptions={{
              mimeType: getSupportedMimeType(),
              videoBitsPerSecond: 2500000
            }}
            render={({ status, startRecording, stopRecording, mediaBlobUrl, clearBlobUrl }) => (
              <div>
                {status === 'stopped' && mediaBlobUrl && (
                  <>
                    {/* <video 
                      src={mediaBlobUrl} 
                      controls 
                      autoPlay 
                      loop 
                      playsInline
                      style={{
                        width: '100%',
                        maxHeight: '70vh',
                        backgroundColor: '#000',
                        display: 'block'
                      }}
                      onLoadedMetadata={(e) => {
                        const video = e.target as HTMLVideoElement;
                        video.load();
                        video.play().catch(err => console.log('Playback failed:', err));
                      }}
                      onError={(e) => {
                        const video = e.target as HTMLVideoElement;
                        console.log('Video error:', video.error);
                      }}
                    /> */}
                    <div className="screen-recorder-buttons">
                      <button className="screen-recorder-button clear-recording" onClick={clearBlobUrl}>
                        <img src={trashIcon} alt="Clear Recording" />
                        <p>Clear Recording</p>
                      </button>
                      <button className="screen-recorder-button accept-recording" onClick={() => acceptScreenRecording(mediaBlobUrl)}>
                        <img src={acceptIcon} alt="Accept Recording" />
                        <p>Accept Recording</p>
                      </button>
                    </div>
                  </>
                )}
                {status === 'idle' ? (
                  <div className="idle-screen-recorder-buttons">
                    <button className="screen-recorder-button" onClick={startRecording}>
                      <img src={startRecordingIcon} alt="Start Screen Recording" />
                      <p>Start Screen Recording</p>
                    </button>
                    <button className="screen-recorder-button cancel-recording" onClick={() => setScreenRecording(false)}>
                      <img src={minusIcon} alt="Cancel" />
                      <p>Cancel</p>
                    </button>
                  </div>
                ) : null}
                {status === 'recording' ? (
                  <button className="screen-recorder-button" onClick={stopRecording}>
                    <img src={stopRecordingIcon} alt="Stop Recording" />
                    <p>Stop Recording</p>
                  </button>
                ) : null}
              </div>
            )}
          />
        </div>
      </ReactModal>

      {canShowMediaUpload && (
        <div className="image-upload" data-tooltip-id="upload-photo-tooltip">
          <label htmlFor="upload-photo">
            <img src={send} />
          </label>
          <Tooltip id="upload-photo-tooltip" content="Upload a Photo or Video" place='top' style={{ zIndex: 9999 }} />
          <input accept="image/*,video/*" onChange={selectFiles} type="file" multiple name="file" id="upload-photo" />
        </div>
      )}
      {!isMobile ? (
        <>
          {canShowMediaUpload && (
            <div className="image-capture" data-tooltip-id="capture-tooltip">
              <label htmlFor="upload-capture" onClick={() => {setIsOpen(true); setShouldInitializeWebcam(true)}}>
                <img src={capture} />
              </label>
              <Tooltip id="capture-tooltip" content="Record a Video" place='top' style={{ zIndex: 9999 }} />
            </div>
          )}
          <div className="screeen-capture" data-tooltip-id="screen-capture-tooltip">
            <label htmlFor="screeen-capture" onClick={() => {setScreenRecording(!screenRecording)}}>
              <img src={screenRecordIcon} />
            </label>
            <Tooltip id="screen-capture-tooltip" content="Record Screen" place='top' style={{ zIndex: 9999 }} />
          </div>
        </>
      ) : null}
      
      {isMobile ? (
        <>
          {canShowCamera && (
            <div className="image-capture">
              <label htmlFor="upload-photo">
                <img src={capture} />
              </label>
              <input accept="image/*,video/*" capture="environment" onChange={selectFiles} type="file" multiple name="file" id="upload-photo" />
            </div>
          )}
        </>
      ) : null}
    </>
  );
};
