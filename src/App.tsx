import { useState, type ChangeEvent } from "react";
import { encryptFile, type EncryptionProgress } from "./Services/encryptFile";
import { createZip } from "./Services/createZip";

function App() {
    const [encryptionProgress, setEncryptionProgress] = useState<EncryptionProgress | null>(null);
    const [dataEncrypt, setDataEncrypt] = useState<string[] | null>(null);
    const [fileName, setFileName] = useState<string>("");

    const handleEncryptFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name.split('.')[0]);
        setEncryptionProgress(null);

        const dataEncrypt = await encryptFile(file, (progress) => {
            setEncryptionProgress(progress);
        })
        setDataEncrypt(dataEncrypt);
    };
    
    const downloadEncryptedFile = () => {
        if (dataEncrypt == null) return;
        if (dataEncrypt?.length > 0) createZip(dataEncrypt, fileName);
    };


    const handleDecryptFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

    };
    

    return (
        <>
            <div>
                <div>
                    <h1>Check-MateData</h1>
                    {/* FILE PICKER INPUT */}
                    <div>
                        <div>
                            <h2>Choisissez un fichier à chiffrer</h2>
                            <input 
                                type="file"
                                id="InputEncrypt"
                                onChange={handleEncryptFileChange}
                                disabled={
                                    encryptionProgress !== null && 
                                    encryptionProgress.stage !== 'ENDED' && 
                                    encryptionProgress.stage !== 'ERROR'
                                }
                            />
                            
                            {encryptionProgress?.stage === 'COMPRESSING' && (
                                <div>
                                    <p>Compression en cours... {encryptionProgress.remainingPercentage?.toFixed(2)}%</p>
                                </div>
                            )}

                            {encryptionProgress?.stage === 'ENCODING' && (
                                <div>
                                    <p>Encodage en cours... {encryptionProgress.remainingPercentage?.toFixed(2)}%</p>
                                </div>
                            )}
                        
                            {encryptionProgress?.stage === 'ERROR' && (
                                <div>
                                    {encryptionProgress?.error === 'FILE_TOO_LARGE' && (
                                        <p>Erreur: Le fichier est trop volumineux. Taille maximale autorisée : 50 Ko.</p>
                                    )}

                                    {encryptionProgress?.error === 'EMPTY_FILE' && (
                                        <p>Erreur: Le fichier est vide.</p>
                                    )}

                                    {encryptionProgress?.error === 'READING_ERROR' && (
                                        <p>Erreur: Impossible de lire le fichier.</p>
                                    )}
                                </div>
                            )}


                            {encryptionProgress?.stage === 'ENDED' && (
                                <button onClick={downloadEncryptedFile}>
                                    Telecharger
                                </button>
                            )}
                        </div>
                        <div>
                            <h2>Fichier a dechiffre</h2>
                            <input 
                                type="file" 
                                onChange={handleDecryptFileChange} 
                                // disabled={
                                //     encryptionProgress !== null && 
                                //     encryptionProgress.stage !== 'ENDED' && 
                                //     encryptionProgress.stage !== 'ERROR'
                                // }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default App
