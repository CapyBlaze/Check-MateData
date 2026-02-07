import JSZip from 'jszip';
import { saveAs } from 'file-saver';


type SaveContent = string | string[] | File | File[];

function toBlob(content: string | File): Blob | File {
    if (typeof content === 'string') {
        return new Blob([content], { type: 'text/plain;charset=utf-8' });
    }

    return content;
}

function toZipName(fileName: string): string {
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    return `${baseName || 'archive'}.zip`;
}


export async function saveFile(contents: SaveContent, fileName: string) {
    if (Array.isArray(contents)) {
        if (contents.length === 1) {
            const item = contents[0];
            saveAs(toBlob(typeof item === 'string' ? item : item), `${fileName}`);
            return;
        }

        if (contents.length > 1) {
            const zip = new JSZip();
            const items = [...contents];
            let index = 0;
            let cursor = 0;

            while (cursor < items.length) {
                const item = items[cursor];
                const fileContent = (typeof item === 'string')
                    ? items.slice(cursor, cursor + 100).join('\n')
                    : item;

                cursor += typeof item === 'string' ? 100 : 1;
                index++;

                zip.file(
                    `${"000".substring(0, 3 - ("" + index).length) + index}_${fileName}`,
                    fileContent
                );
            }

            const blob = await zip.generateAsync({ type: 'blob' });
            saveAs(blob, toZipName(fileName));
        }

        return;
    }

    saveAs(toBlob(contents), fileName);
}