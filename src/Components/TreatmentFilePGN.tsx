import { useEffect, useEffectEvent, useRef, useState } from "react";
import { unzipFile } from "../Services/unzipFile";
import { type DecryptionProgress } from "../Services/decryptFile";
import { saveFile } from "../Services/saveFile";
import DecryptionWorker from '../worker/decrypt.worker?worker';
import { formatFileSize } from "../Utils/formatFileSize";


interface TreatmentFilePGNProps {
    file: File;
    onReset?: () => void;
    onNotification?: (message: string, style: 'error' | 'success', time?: number) => void;
}


export function TreatmentFilePGN({ 
    file, 
    onReset,
    onNotification
}: TreatmentFilePGNProps) {

    const [decryptedFile, setDecryptedFile] = useState<File | null>(null);
    const [decryptionProgress, setDecryptionProgress] = useState<DecryptionProgress | null>(null);

    const progress = decryptionProgress?.remainingPercentage ?? 0;
    const isCompleted = decryptionProgress?.stage === 'ENDED';
    const hasNotifiedSuccess = useRef(false);
    const hasFinished = useRef(false);

    const updateDecryptionProgress = useEffectEvent((decryptionProgressContent: DecryptionProgress | null) => {
        setDecryptionProgress(decryptionProgressContent);
    });

    const updateDecryptedFile = useEffectEvent((decryptedFileContent: File | null) => {
        setDecryptedFile(decryptedFileContent);
    });


    useEffect(() => {
        hasNotifiedSuccess.current = false;
        hasFinished.current = false;
        updateDecryptionProgress(null);
        updateDecryptedFile(null);

        const runWorker = async () => {
            try {
                let files: File[] = [file];
                if (file.name.endsWith('.zip')) {
                    files = await unzipFile(file);
                }

                const worker = new DecryptionWorker();

                worker.onmessage = (event) => {
                    const { type, payload } = event.data;

                    if (hasFinished.current && type === 'PROGRESS') return;

                    if (type === 'PROGRESS') {
                        updateDecryptionProgress(payload);

                    } else if (type === 'SUCCESS') {
                        hasFinished.current = true;

                        updateDecryptedFile(payload);
                        worker.terminate();

                    } else if (type === 'ERROR') {
                        onNotification?.(payload, 'error');
                        worker.terminate();
                    }
                };

                worker.postMessage({ files });
                
                currentWorker = worker;

            } catch {
                onNotification?.("Error unzipping.", 'error');
            }
        };

        let currentWorker: Worker | null = null;

        if (file) runWorker();

        return () => {
            if (currentWorker) currentWorker.terminate();
        };
    }, [file, onNotification]);

    useEffect(() => {
        if (isCompleted && decryptedFile && !hasNotifiedSuccess.current) {
            onNotification?.(`Decoded in ${decryptionProgress?.encodingInfo?.numberMatches} matches and ${decryptionProgress?.encodingInfo?.numberMoves} moves.`, 'success');
            hasNotifiedSuccess.current = true;
        }
    }, [isCompleted, decryptedFile, onNotification, decryptionProgress]);


    const downloadDecryptedFile = () => {
        if (!decryptedFile) return;
        saveFile(decryptedFile, decryptedFile.name);
    }


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
                        {isCompleted ? '♛' : '♞'}
                    </div>
                </div>


                {!isCompleted && (
                    <>
                        {/* Status Text */}
                        <div className="text-center mb-4">
                            <p className="text-white text-lg font-medium">
                                {!decryptionProgress && 'Initialization...'}
                                {decryptionProgress?.stage === 'DECODING' && 'Data decoding...'}
                                {decryptionProgress?.stage === 'ENDED' && 'Decryption complete!'}
                            </p>
                            {decryptionProgress?.stage === 'DECODING' && (
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
                {decryptionProgress?.stage === 'DECODING' && (
                    <div className="mt-4 text-center">
                        <p className="text-gray-400 text-sm">
                            Transformation into original file
                        </p>
                    </div>
                )}

                {/* Download Button */}
                {isCompleted && (
                    <button
                        onClick={downloadDecryptedFile}
                        className="download-button w-full"
                    >
                        <span>Download decrypted file</span>
                    </button>
                )}
            </div>
        </div>
    );
}