import { useState, useEffect } from "react";
import { encryptFile, type EncryptionProgress } from "./../Services/encryptFile";
import { createZip } from "./../Services/createZip";
import { formatFileSize } from "../Utils/formatFileSize";


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

    
    useEffect(() => {
        const start = async () => {
            if (!file) return;

            setFileName(file.name.split('.')[0]);
            setEncryptionProgress(null);
            setDataEncrypt(null);

            try {
                const result = await encryptFile(file, (progress) => {
                    setEncryptionProgress(progress);
                });

                if (result.length === 0) {
                    onError?.("An error occurred while reading the file.");
                    return;
                }

                setDataEncrypt(result);

            } catch {
                onError?.("An error occurred during file encryption.");
            }
        };

        start();
    }, [file, onError]);
    
    
    const downloadEncryptedFile = () => {
        if (dataEncrypt == null) return;
        if (dataEncrypt.length > 0) createZip(dataEncrypt, fileName);
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
            <div className="progress-section glass rounded-xl p-5 mb-6">
                {/* Animated Chess Piece */}
                <div className="chess-animation-container mb-4">
                    <div className={`chess-piece-animated ${isCompleted ? 'completed' : ''}`}>
                        {isCompleted ? '♛' : encryptionProgress?.stage === 'COMPRESSING' ? '♜' : '♞'}
                    </div>
                </div>


                {!isCompleted && (
                    <>
                        {/* Status Text */}
                        <div className="text-center mb-4">
                            <p className="text-white text-lg font-medium">
                                {!encryptionProgress && 'Initialisation...'}
                                {encryptionProgress?.stage === 'COMPRESSING' && 'Compression en cours...'}
                                {encryptionProgress?.stage === 'ENCODING' && 'Encodage des données...'}
                                {encryptionProgress?.stage === 'ENDED' && 'Chiffrement terminé !'}
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
                            Transformation en notation d'échecs
                        </p>
                    </div>
                )}

                {/* Download Button */}
                {isCompleted && (
                    <button 
                        onClick={downloadEncryptedFile} 
                        className="download-button w-full"
                    >
                        <span>Télécharger le fichier chiffré</span>
                    </button>
                )}
            </div>
        </div>
    );
}