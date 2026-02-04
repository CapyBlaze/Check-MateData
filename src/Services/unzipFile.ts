import JSZip from 'jszip';

export async function unzipFile(file: File): Promise<File[]> {
    const zip = await new JSZip().loadAsync(file);
    const promises: Promise<File>[] = [];

    zip.forEach((_relativePath, zipEntry) => {
        if (!zipEntry.dir) {
            const promise = zipEntry.async("blob").then(blob => {
                return new File([blob], zipEntry.name);
            });
            promises.push(promise);
        }
    });

    const results = await Promise.all(promises);
    return results;
}
