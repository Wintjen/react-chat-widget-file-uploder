import React, {useEffect, useRef, useState} from "react";
import { RecordWebcam } from 'react-record-webcam'
import { useRecordWebcam } from 'react-record-webcam'


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
            <svg style={status === 'INIT' ? {transform: `rotate(${rotation}deg)`} : {display: 'none'}} width="45" height="45" viewBox="0 0 48 48" fill="black" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" fill="white" fill-opacity="0.01"/><path d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z" fill="none" stroke="#333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 12V15" stroke="#333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/><path d="M32.4853 15.5147L30.364 17.636" stroke="#333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/><path d="M36 24H33" stroke="#333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/><path d="M32.4853 32.4853L30.364 30.364" stroke="#333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/><path d="M24 36V33" stroke="#333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5147 32.4853L17.636 30.364" stroke="#333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 24H15" stroke="#333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5147 15.5147L17.636 17.636" stroke="#333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/></svg>
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
    setBlob: (blob: Blob) => void
    setIsOpen: () => void
    shouldInitializeWebcam: boolean
    setShouldInitializeWebcam: (bool) => void
}

const Webcam = ({setBlob, setIsOpen, shouldInitializeWebcam, setShouldInitializeWebcam}: WebcamProps) => {
    
    const [isLoading, setIslLoading] = useState(true)

    const RecordVideo = () => {
        const recordWebcam = useRecordWebcam({ frameRate: 60, height: 315, width: 560});

        const exit = () => {
            setIsOpen()
            setShouldInitializeWebcam(false)
            recordWebcam.close()
        }

        const saveFile = async () => {
            const blob = await recordWebcam.getRecording();
            if (blob) {
                setShouldInitializeWebcam(false)
                recordWebcam.close()
                setBlob(blob)
            }
            setIsOpen()
        };

        if (recordWebcam.status === 'CLOSED' && shouldInitializeWebcam) {
            recordWebcam.open()
        }



        return (
          <div>
                <div onClick={exit} style={{position: 'absolute', top: 0, right: 0}}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="IconChangeColor" height="40" width="40"> <g> <path fill="none" d="M0 0h24v24H0z" id="mainIconPathAttribute"></path> <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-9.414l2.828-2.829 1.415 1.415L13.414 12l2.829 2.828-1.415 1.415L12 13.414l-2.828 2.829-1.415-1.415L10.586 12 7.757 9.172l1.415-1.415L12 10.586z" id="mainIconPathAttribute"></path> </g> </svg>
                </div>
                <LoadingIcon status={recordWebcam.status} stop={recordWebcam.status === 'OPEN' ? true : false} />
                <div className="controls">
                    <video style={recordWebcam.status === 'PREVIEW' ? {display: 'none'} : {display: 'block', height: 315, width: 560}} ref={recordWebcam.webcamRef} autoPlay muted />
                    <video style={recordWebcam.status === 'PREVIEW' ? {display: 'block', height: 315, width: 560} : {display: 'none'}} ref={recordWebcam.previewRef} autoPlay muted loop />
                    <div style={recordWebcam.status === 'INIT' ?{display: 'none'} : {display: 'flex', justifyContent: 'center', marginTop: '10px'}}>
                        <div className="record" onMouseDown={(e) => e.currentTarget.style.transform = 'scale(.9)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            <RecordingIcon status={recordWebcam.status} stop={recordWebcam.status !== 'RECORDING' ? true : false} start={recordWebcam.start} />
                        </div>
                        <div  onClick={recordWebcam.stop} style={{marginLeft: '12px', cursor: 'pointer'}} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(.9)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="black" className="bi bi-stop-circle" viewBox="0 0 16 16"> <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/> <path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3z"/> </svg>
                            {/* <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-stop-btn-fill" viewBox="0 0 16 16"> <path d="M0 12V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm6.5-7A1.5 1.5 0 0 0 5 6.5v3A1.5 1.5 0 0 0 6.5 11h3A1.5 1.5 0 0 0 11 9.5v-3A1.5 1.5 0 0 0 9.5 5h-3z"/> </svg> */}
                        </div>
                        <div onClick={recordWebcam.retake} style={{marginLeft: '12px', cursor: 'pointer'}} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(.9)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-skip-start-circle" viewBox="0 0 16 16"> <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/> <path d="M10.229 5.055a.5.5 0 0 0-.52.038L7 7.028V5.5a.5.5 0 0 0-1 0v5a.5.5 0 0 0 1 0V8.972l2.71 1.935a.5.5 0 0 0 .79-.407v-5a.5.5 0 0 0-.271-.445z"/> </svg>
                            {/* <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16"> <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/> <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/> </svg> */}
                        </div>
                        <div className="select" style={{marginLeft: '12px'}} onMouseDown={(e) => e.currentTarget.style.transform = 'scale(.9)'} onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                            <button style={{height: '37px'}} className={'quick-button'} onClick={saveFile}>OK</button>    
                        </div>
                    </div>
                </div>
          </div>
        )
      }

    return (
        <> 
            <RecordVideo />
        </>
    )

}

export default Webcam