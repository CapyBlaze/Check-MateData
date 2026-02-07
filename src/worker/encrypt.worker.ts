// worker.ts
import { encryptFile } from "../Services/encryptFile";


self.onmessage = async (event: MessageEvent<{ file: File }>) => {
    const { file } = event.data;

    try {
        const result = await encryptFile(file, (progress) => {
            self.postMessage({ 
                type: 'PROGRESS', 
                payload: progress 
            });
        });

        self.postMessage({ 
            type: 'SUCCESS', 
            payload: result 
        });

    } catch {
        self.postMessage({ 
            type: 'ERROR', 
            payload: "Error during encryption." 
        });
    }
};

export {};
