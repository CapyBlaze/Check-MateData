import JSZip from 'jszip';
import { saveAs } from 'file-saver';


export async function createZip(contents: string[], fileName: string) {
    const zip = new JSZip();

    let index = 0;
    while (contents.length > 0) {
        const fileContent = contents.splice(0, 100).join('\n');

        index++;
        zip.file(`${"000".substring(0, 3 - ("" + index).length) + index}_${fileName}.pgn`, 
            fileContent
        );
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${fileName}.zip`);
}