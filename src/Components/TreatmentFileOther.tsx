import { useState, useEffect, useEffectEvent, useRef } from "react";
import { type EncryptionProgress } from "./../Services/encryptFile";
import { saveFile } from "../Services/saveFile";
import EncryptionWorker from '../worker/encrypt.worker?worker';
import { formatFileSize } from "../Utils/formatFileSize";
import { createPortal } from "react-dom";


interface TreatmentFileOtherProps {
    file: File;
    onReset?: () => void;
    onNotification?: (message: string, style: 'error' | 'success', time?: number) => void;
}


export function TreatmentFileOther({ 
    file,
    onReset,
    onNotification,
}: TreatmentFileOtherProps) {

    const [encryptionProgress, setEncryptionProgress] = useState<EncryptionProgress | null>(null);
    const [dataEncrypt, setDataEncrypt] = useState<string[] | null>(null);
    const [fileName, setFileName] = useState<string>("");

    const progress = encryptionProgress?.remainingPercentage ?? 0;
    const isCompleted = encryptionProgress?.stage === 'ENDED';
    const hasNotifiedSuccess = useRef(false);
    const hasFinished = useRef(false);

    
    const updateFileInfo = useEffectEvent((file: File) => {
        setFileName(file.name);
    });

    const updateEncryptionProgress = useEffectEvent((encryptionProgressContent: EncryptionProgress | null) => {
        setEncryptionProgress(encryptionProgressContent);
    });

    const updateDataEncrypt = useEffectEvent((dataEncryptContent: string[] | null) => {
        setDataEncrypt(dataEncryptContent);
    })


    useEffect(() => {
        if (!file) return;

        hasNotifiedSuccess.current = false;
        hasFinished.current = false;
        updateFileInfo(file);
        updateEncryptionProgress(null);
        updateDataEncrypt(null);

        const worker = new EncryptionWorker();

        worker.onmessage = (event) => {
            const { type, payload } = event.data;

            if (hasFinished.current && type === 'PROGRESS') return;

            if (type === 'PROGRESS') {
                updateEncryptionProgress(payload);

            } else if (type === 'SUCCESS') {
                hasFinished.current = true;
                updateDataEncrypt(payload);
                worker.terminate();

            } else if (type === 'ERROR') {
                onNotification?.(payload, 'error');
                worker.terminate();
            }
        };

        worker.postMessage({ file });

        return () => worker.terminate();
    }, [file, onNotification]);
    
    useEffect(() => {
        if (isCompleted && dataEncrypt && !hasNotifiedSuccess.current) {
            onNotification?.(`Encoded in ${encryptionProgress?.encodingInfo?.numberMatches} matches and ${encryptionProgress?.encodingInfo?.numberMoves} moves.`, 'success');
            hasNotifiedSuccess.current = true;
        }
    }, [isCompleted, dataEncrypt, onNotification, encryptionProgress]);
    
    
    const downloadEncryptedFile = () => {
        if (dataEncrypt == null) return;

        const finalFileName = fileName.includes('.') ? fileName.substring(0, fileName.lastIndexOf('.')) : fileName;

        if (dataEncrypt.length == 1) {
            saveFile(dataEncrypt, `${finalFileName}.pgn`);
        }

        if (dataEncrypt.length > 1) {
            saveFile(dataEncrypt, `${finalFileName}.pgn`);
        }
    };


    return (
        <>
        
            <div className="w-full max-w-md p-6">
                {/* File Info Card */}
                <div className="file-info-card glass rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="file-icon-wrapper cursor-default noSelect">
                            <span className="text-3xl">📄</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate" title={file.name}>
                                {file.name}
                            </p>
                            <p className="text-gray-400 text-sm">
                                {formatFileSize(file.size)}
                            </p>
                        </div>
                        <div className="opacity-85 cursor-pointer" onClick={onReset}>
                            <svg width="32" height="32" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M368 368L144 144" stroke="white" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M368 144L144 368" stroke="white" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Progress Section */}
                <div className="noSelect progress-section glass rounded-xl p-5 mb-6">
                    {/* Animated Chess Piece */}
                    <div className="noSelect chess-animation-container mb-4">
                        <div className={`noSelect chess-piece-animated ${isCompleted ? 'completed' : ''}`}>
                            {isCompleted ? '♛' : encryptionProgress?.stage === 'COMPRESSING' ? '♜' : '♞'}
                        </div>
                    </div>


                    {!isCompleted && (
                        <>
                            {/* Status Text */}
                            <div className="text-center mb-4">
                                <p className="text-white text-lg font-medium">
                                    {!encryptionProgress && 'Initialization...'}
                                    {encryptionProgress?.stage === 'COMPRESSING' && 'Compression in progress...'}
                                    {encryptionProgress?.stage === 'ENCODING' && 'Data encoding...'}
                                    {encryptionProgress?.stage === 'ENDED' && 'Encryption complete!'}
                                </p>
                                {encryptionProgress?.stage === 'ENCODING' && (
                                    <p className="text-accent text-2xl font-bold mt-1">
                                        {progress.toFixed(1)}%
                                    </p>
                                )}
                            </div>

                            {/* Progress Bar */}
                            <div className="progress-bar-container">
                                <div className="progress-bar-bg">
                                    <div 
                                        className={`progress-bar-fill ${isCompleted ? 'completed' : ''}`}
                                        style={{ 
                                            width: isCompleted ? '100%' : `${progress}%` 
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Encoding Details */}
                    {encryptionProgress?.stage === 'ENCODING' && (
                        <div className="mt-4 text-center">
                            <p className="text-gray-400 text-sm">
                                Transformation into chess notation
                            </p>
                        </div>
                    )}

                    {/* Download Button */}
                    {isCompleted && (
                        <button 
                            onClick={downloadEncryptedFile} 
                            className="download-button w-full"
                        >
                            <span>Download encrypted file</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Save button */}
            {isCompleted && (
                <>
                    {createPortal(
                        <button 
                            className="pop-in opacity-50 hover:opacity-80! absolute bottom-28 right-4 cursor-pointer transition-all duration-300"
                            onClick={() => {
                                console.log("ddddd");
                            }}
                        >
                            <svg className="w-9 h-auto" width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M256 32C379.7 32 480 134.9 480 261.7C480 388.5 379.7 491.4 256 491.4C132.3 491.4 32.0001 388.5 32 261.7C32 134.9 132.3 32.0001 256 32ZM156 116C145.391 116 135.217 120.214 127.716 127.716C120.214 135.217 116 145.391 116 156V356C116 366.609 120.214 376.783 127.716 384.284C135.217 391.786 145.391 396 156 396H356C366.609 396 376.783 391.786 384.284 384.284C391.786 376.783 396 366.609 396 356V192.062C396.011 188.121 395.24 184.217 393.731 180.576C392.223 176.935 390.007 173.629 387.212 170.85L341.15 124.788C338.371 121.993 335.065 119.777 331.424 118.269C327.783 116.76 323.879 115.989 319.938 116H156ZM246.82 266.849C256.738 264.997 266.983 266.188 276.211 270.267C285.439 274.345 293.217 281.12 298.523 289.7C303.83 298.281 306.417 308.266 305.943 318.344C305.351 330.777 300.146 342.543 291.345 351.345C282.543 360.146 270.777 365.351 258.344 365.943C248.266 366.417 238.281 363.83 229.7 358.523C221.12 353.217 214.345 345.439 210.267 336.211C206.188 326.983 204.997 316.738 206.849 306.82C208.701 296.903 213.51 287.778 220.644 280.644C227.778 273.51 236.903 268.701 246.82 266.849ZM256 286C239.432 286 226 299.432 226 316C226 332.569 239.431 346 256 346C272.568 346 286 332.568 286 316C286 299.432 272.568 286 256 286ZM281 166C282.326 166 283.597 166.527 284.535 167.465C285.473 168.403 286 169.674 286 171V201C286 202.326 285.473 203.597 284.535 204.535C283.597 205.473 282.326 206 281 206H171C169.674 206 168.403 205.473 167.465 204.535C166.527 203.597 166 202.326 166 201V171C166 169.674 166.527 168.403 167.465 167.465C168.403 166.527 169.674 166 171 166H281Z" fill="white"/>
                            </svg>
                        </button>, 
                        document.getElementById('root') || document.body
                    )}
                </>
            )}
        </>
    );
}