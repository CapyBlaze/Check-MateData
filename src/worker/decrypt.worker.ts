// worker.ts
import { decryptFile } from "../Services/decryptFile";


self.onmessage = async (event: MessageEvent<{ files: File[] }>) => {
    const { files } = event.data;

    try {
        const result = await decryptFile(files, (progress) => {
            self.postMessage({ 
                type: 'PROGRESS', 
                payload: progress 
            });
        });

        self.postMessage({ 
            type: 'SUCCESS', 
            payload: result 
        });

    } catch (error: Error | unknown) {
        self.postMessage({ 
            type: 'ERROR', 
            payload: error instanceof Error ? error.message : String(error)
        });
    }
};

export {};
