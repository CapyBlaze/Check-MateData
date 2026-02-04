import JSZip from 'jszip';
import { saveAs } from 'file-saver';


export async function saveFile(contents: string | string[] | File | File[], fileName: string) {
    if (Array.isArray(contents)) {
        if (contents.length === 1) {
            saveAs(contents[0], `${fileName}`);
    
        } else if (contents.length > 1) {
            const zip = new JSZip();
        
            let index = 0;
            while (contents.length > 0) {
                const fileContent = (typeof contents[0] === 'string') ? 
                    contents.splice(0, 100).join('\n') :
                    contents.splice(0, 1)[0];
    
                index++;
                zip.file(`${"000".substring(0, 3 - ("" + index).length) + index}_${fileName}`, 
                    fileContent
                );
            }
        
            const blob = await zip.generateAsync({ type: 'blob' });
            saveAs(blob, `${fileName.split('.').slice(0, -2).join('.')}.zip`);
        }

    } else {
        saveAs(contents, fileName);
    }
}