import React, {useEffect, useRef, useState} from "react";
import { RecordWebcam } from 'react-record-webcam'
import { useRecordWebcam } from 'react-record-webcam'
import {
    MediaPermissionsError,
    MediaPermissionsErrorType,
    requestMediaPermissions
  } from 'mic-check'

// Define a type for the recordWebcam object
interface WebcamInstance {
  status: string;
  open: () => Promise<any>;
  close: () => void;
  start: () => void;
  stop: () => void;
  retake: () => void;
  getRecording: () => Promise<Blob | undefined>;
  webcamRef: React.RefObject<any>;
  previewRef: React.RefObject<any>;
}

// Tooltip component
const Tooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="tooltip-container" 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div 
          className="tooltip" 
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '5px',
            padding: '4px 8px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 100,
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};

const LoadingIcon = ({status, stop}) => {
    const [rotation, setRotation] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
                if (!stop) {
                    setRotation(rotation => rotation + 1);
                }
        }, 10);
    
        return () => {
            if (intervalRef.current)
                clearInterval(intervalRef.current);
        };
    }, []);
    return (
        <div className="loading" style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
            <svg style={status === 'INIT' ? {transform: `rotate(${rotation}deg)`} : {display: 'none'}} width="45" height="45" viewBox="0 0 48 48" fill="black" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" fill="white" fillOpacity="0.01"/><path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" fill="none" stroke="#333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/><path d="M24 12V15" stroke="#333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/><path d="M32.4853 15.5147L30.364 17.636" stroke="#333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/><path d="M36 24H33" stroke="#333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/><path d="M32.4853 32.4853L30.364 30.364" stroke="#333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/><path d="M24 36V33" stroke="#333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.5147 32.4853L17.636 30.364" stroke="#333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 24H15" stroke="#333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.5147 15.5147L17.636 17.636" stroke="#333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
    )
}

const RecordingIcon = ({status, stop, start}) => {
    const [blink, setBlink] = useState(true);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        intervalRef.current = setInterval(() => {
                if (!stop) {
                    setBlink(blink => !blink);
                }
        }, 600);
    
        return () => {
            if (intervalRef.current)
                clearInterval(intervalRef.current);
        };
    }, [stop]);
    return (
        <div onClick={start} style={{cursor: 'pointer'}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill={blink ? "red" : "black"} className="bi bi-record-circle-fill" viewBox="0 0 16 16"> <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-8 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/> </svg>
            {/* <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="red" className="bi bi-record-btn" viewBox="0 0 16 16"> <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/> <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/> </svg> */}
        </div>
    )
}

interface WebcamProps {
    open: boolean
    setBlob: (blob: Blob) => void
    setIsOpen: () => void
    shouldInitializeWebcam: boolean
    setShouldInitializeWebcam: (bool) => void
}

const Webcam = ({setBlob, open, setIsOpen, shouldInitializeWebcam, setShouldInitializeWebcam}: WebcamProps) => {
    
    const [isLoading, setIslLoading] = useState(true)
    const [permissionDenied, setPermissionDenied] = useState(false);
    // Create a properly typed ref to hold the webcam instance
    const webcamRef = useRef<WebcamInstance | null>(null);

    const RecordVideo: React.FC<{open: boolean}> = ({open}) => {
        const recordWebcam = useRecordWebcam({ frameRate: 60, height: 315, width: 560});
        
        // Store the webcam instance in the ref so we can access it outside the component
        useEffect(() => {
            webcamRef.current = recordWebcam as any; // Type assertion to fix type error
        }, [recordWebcam]);

        useEffect(() => {
            const openWebcam = async () => {
                try {
                    const permission = await requestMediaPermissions()
                    const result = await recordWebcam.open()
                    setPermissionDenied(false)
                } catch (err) {
                    console.log('permission denied error: ', err)
                    setPermissionDenied(true)
                }
            }
            if (shouldInitializeWebcam)
                openWebcam()
        }, [shouldInitializeWebcam]);

        useEffect(() => {
            console.log('open', open)
        }, [])

        // Add cleanup effect that will run when component unmounts
        useEffect(() => {
            // This cleanup function runs when component unmounts
            return () => {
                if (recordWebcam.status !== 'CLOSED') {
                    console.log('Cleaning up webcam on unmount');
                    recordWebcam.close();
                    setShouldInitializeWebcam(false);
                }
            };
        }, []); // Empty dependency array means this only runs on mount/unmount

        const exit = () => {
            setIsOpen()
            setShouldInitializeWebcam(false)
            recordWebcam.close()
        }

        const saveFile = async () => {
            // If currently recording, stop recording
            if (recordWebcam.status === 'RECORDING') {
                recordWebcam.stop();
                return; // Exit the function - user will need to click OK again after stopping
            }
            
            // Only proceed if we have a recording to save (PREVIEW state)
            if (recordWebcam.status === 'PREVIEW') {
                try {
                    // CRITICAL: First set flag to prevent any reinitialization
                    setShouldInitializeWebcam(false);
                    
                    // Then close the webcam immediately
                    recordWebcam.close();
                    
                    // Only after webcam is closed, get the recording
                    const blob = await recordWebcam.getRecording();
                    
                    if (blob) {
                        // Finally pass the blob back and close modal
                        setBlob(blob);
                        setIsOpen();
                    } else {
                        console.error('No recording available');
                        setIsOpen(); // Still close the modal
                    }
                } catch (error) {
                    console.error('Error saving recording:', error);
                    setIsOpen(); // Close modal even on error
                }
            } else if (recordWebcam.status === 'OPEN') {
                // If webcam is open but no recording was made
                alert('Please record something first or close the webcam');
            }
        };

        // const handleReRequestPermissions = () => {
        //     console.log('handleReRequestPermissions');
        //     // Stop the current recording if any
        //     if (recordWebcam.status === 'OPEN' || recordWebcam.status === 'RECORDING') {
        //         recordWebcam.stop();
        //     }

        //     // Re-initialize the webcam to re-request permissions
        //     recordWebcam.open();
        // };

        // if (recordWebcam.status === 'CLOSED' && shouldInitializeWebcam) {
        //     recordWebcam.open()
        // }

        console.log('recordWebcam.status', recordWebcam.status)

        return (
          <div>
                <div onClick={exit} style={{position: 'absolute', top: 0, right: 0}}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="IconChangeColor" height="40" width="40"> <g> <path fill="none" d="M0 0h24v24H0z" id="mainIconPathAttribute"></path> <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-9.414l2.828-2.829 1.415 1.415L13.414 12l2.829 2.828-1.415 1.415L12 13.414l-2.828 2.829-1.415-1.415L10.586 12 7.757 9.172l1.415-1.415L12 10.586z" id="mainIconPathAttribute"></path> </g> </svg>
                </div>
                {permissionDenied ? (
                    <>
                        <div style={{color: '#E57373', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', paddingLeft: 20, paddingRight: 20}}>Webcam permission denied. Please enable webcam access in your browser settings.</div>
                    </>
                ) : (
                    <>
                        <LoadingIcon status={recordWebcam.status} stop={recordWebcam.status === 'OPEN' ? true : false} />
                        <div className="controls">
                            <video style={recordWebcam.status === 'PREVIEW' ? {display: 'none'} : {display: 'block', height: 315, width: 560}} ref={recordWebcam.webcamRef} autoPlay muted />
                            <video style={recordWebcam.status === 'PREVIEW' ? {display: 'block', height: 315, width: 560} : {display: 'none'}} ref={recordWebcam.previewRef} autoPlay muted loop controls/>
                            <div style={recordWebcam.status === 'INIT' ?{display: 'none'} : {display: 'flex', justifyContent: 'center', marginTop: '10px'}}>
                                <div className="record" onMouseDown={(e) => e.currentTarget.style.transform = 'scale(.9)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                    <Tooltip text={'Start Recording'}>
                                      <div>
                                          <RecordingIcon status={recordWebcam.status} stop={recordWebcam.status !== 'RECORDING' ? true : false} start={recordWebcam.start} />
                                      </div>
                                    </Tooltip>
                                </div>
                                {/* <Tooltip text="Stop Recording">
                                  <div onClick={recordWebcam.stop} style={{marginLeft: '12px', cursor: 'pointer'}} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(.9)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="black" className="bi bi-stop-circle" viewBox="0 0 16 16"> <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/> <path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3z"/> </svg>
                                  </div>
                                </Tooltip> */}
                                <Tooltip text="Retake Recording">
                                  <div onClick={recordWebcam.retake} style={{marginLeft: '12px', cursor: 'pointer'}} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(.9)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
                                        <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2v1z"/>
                                        <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466z"/>
                                      </svg>
                                  </div>
                                </Tooltip>
                                <Tooltip text={recordWebcam.status === 'RECORDING' ? 'Stop Recording' : 'Save Recording'}>
                                  <div className="select" style={{marginLeft: '12px'}} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(.9)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                                      <button style={{height: '37px'}} className={'quick-button'} onClick={saveFile}>
                                          {recordWebcam.status === 'RECORDING' ? 'Stop' : 'OK'}
                                      </button>    
                                  </div>
                                </Tooltip>
                            </div>
                        </div>
                    </>
                )}
          </div>
        )
      }

    // Add a cleanup effect at the parent component level
    useEffect(() => {
        // Cleanup when parent component unmounts
        return () => {
            if (webcamRef.current && webcamRef.current.status !== 'CLOSED') {
                console.log('Cleaning up webcam on parent unmount');
                webcamRef.current.close();
                setShouldInitializeWebcam(false);
            }
        };
    }, []);

    return (
        <> 
            <RecordVideo open={open} />
        </>
    )
}

export default Webcam