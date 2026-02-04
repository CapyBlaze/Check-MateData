import { useEffect, useEffectEvent, useState } from "react";
import { unzipFile } from "../Services/unzipFile";
import { type DecryptionProgress } from "../Services/decryptFile";
import { formatFileSize } from "../Utils/formatFileSize";
import { saveFile } from "../Services/saveFile";
import DecryptionWorker from '../worker/decrypt.worker?worker';


interface TreatmentFilePGNProps {
    file: File;
    onError?: (message: string) => void;
}

export function TreatmentFilePGN({ 
    file, 
    onError 
}: TreatmentFilePGNProps) {

    const [decryptedFile, setDecryptedFile] = useState<File | null>(null);
    const [decryptionProgress, setDecryptionProgress] = useState<DecryptionProgress | null>(null);

    const updateDecryptionProgress = useEffectEvent((decryptionProgressContent: DecryptionProgress | null) => {
        setDecryptionProgress(decryptionProgressContent);
    });

    const updateDecryptedFile = useEffectEvent((decryptedFileContent: File | null) => {
        setDecryptedFile(decryptedFileContent);
    });


    useEffect(() => {
        const runWorker = async () => {
            try {
                const files = await unzipFile(file);

                updateDecryptionProgress(null);
                updateDecryptedFile(null);

                const worker = new DecryptionWorker();

                worker.onmessage = (event) => {
                    const { type, payload } = event.data;
                    if (type === 'PROGRESS') {
                        updateDecryptionProgress(payload);

                    } else if (type === 'SUCCESS') {
                        updateDecryptedFile(payload);
                        worker.terminate();

                    } else if (type === 'ERROR') {
                        onError?.(payload);
                        worker.terminate();
                    }
                };

                worker.postMessage({ files });
                
                currentWorker = worker;

            } catch {
                onError?.("Erreur lors du dézippage.");
            }
        };

        let currentWorker: Worker | null = null;

        if (file) runWorker();

        return () => {
            if (currentWorker) currentWorker.terminate();
        };

    }, [file, onError]);

    const downloadDecryptedFile = () => {
        if (!decryptedFile) return;
        saveFile(decryptedFile, decryptedFile.name);
    }


    const progress = decryptionProgress?.remainingPercentage ?? 0;
    const isCompleted = decryptionProgress?.stage === 'ENDED';

    return (
        <div className="w-full max-w-md p-6">
            {/* File Info Card */}
            <div className="file-info-card glass rounded-xl p-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="file-icon-wrapper">
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