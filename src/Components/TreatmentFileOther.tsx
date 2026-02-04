import { useState, useEffect, useEffectEvent } from "react";
import { type EncryptionProgress } from "./../Services/encryptFile";
import { saveFile } from "../Services/saveFile";
import { formatFileSize } from "../Utils/formatFileSize";
import EncryptionWorker from '../worker/encrypt.worker?worker';


interface TreatmentFileOtherProps {
    file: File;
    onError?: (message: string) => void;
}


export function TreatmentFileOther({ 
    file, 
    onError 
}: TreatmentFileOtherProps) {

    const [encryptionProgress, setEncryptionProgress] = useState<EncryptionProgress | null>(null);
    const [dataEncrypt, setDataEncrypt] = useState<string[] | null>(null);
    const [fileName, setFileName] = useState<string>("");

    
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

        updateFileInfo(file);
        updateEncryptionProgress(null);
        updateDataEncrypt(null);

        // Initialisation du worker
        const worker = new EncryptionWorker();

        // Écoute des messages venant du worker
        worker.onmessage = (event) => {
            const { type, payload } = event.data;

            if (type === 'PROGRESS') {
                updateEncryptionProgress(payload);

            } else if (type === 'SUCCESS') {
                updateDataEncrypt(payload);
                worker.terminate(); // Libère la mémoire

            } else if (type === 'ERROR') {
                onError?.(payload);
                worker.terminate();
            }
        };

        // Lancement de la mission
        worker.postMessage({ file });

        // Nettoyage si le composant est démonté
        return () => worker.terminate();


    }, [file, onError]);
    
    
    const downloadEncryptedFile = () => {
        if (dataEncrypt == null) return;
        if (dataEncrypt.length > 0) saveFile(dataEncrypt, `${fileName}.pgn`);
    };



    const progress = encryptionProgress?.remainingPercentage ?? 0;
    const isCompleted = encryptionProgress?.stage === 'ENDED';

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
                                        width: isCompleted ? '100%' : 
                                            encryptionProgress?.stage === 'COMPRESSING' ? '15%' :
                                            `${Math.max(15, progress)}%` 
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