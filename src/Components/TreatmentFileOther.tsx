import { useState, useEffect, useEffectEvent, useRef } from "react";
import { type EncryptionProgress } from "./../Services/encryptFile";
import { saveFile } from "../Services/saveFile";
import EncryptionWorker from '../worker/encrypt.worker?worker';
import { formatFileSize } from "../Utils/formatFileSize";


interface TreatmentFileOtherProps {
    file: File;
    onReset?: () => void;
    onNotification?: (message: string, style: 'error' | 'success') => void;
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
        if (dataEncrypt.length > 0) saveFile(dataEncrypt, `${fileName}.pgn`);
    };


    return (
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
    );
}