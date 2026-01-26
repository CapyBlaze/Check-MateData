import { useState, useEffect } from "react";
import { encryptFile, type EncryptionProgress } from "./../Services/encryptFile";
import { createZip } from "./../Services/createZip";


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


    return (
        <div>
            {encryptionProgress?.stage === 'COMPRESSING' && (
                <div>
                    <p>Compressing... {encryptionProgress.remainingPercentage?.toFixed(2)}%</p>
                </div>
            )}

            {encryptionProgress?.stage === 'ENCODING' && (
                <div>
                    <p>Encoding... {encryptionProgress.remainingPercentage?.toFixed(2)}%</p>
                </div>
            )}

            {encryptionProgress?.stage === 'ENDED' && (
                <button onClick={downloadEncryptedFile}>
                    Download
                </button>
            )}
        </div>
    );
}