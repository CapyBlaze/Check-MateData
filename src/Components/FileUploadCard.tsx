import { useRef, useState, type DragEvent } from "react";


const MAX_SIZE_FILE = 50 * 1024; // 50 Ko

interface FileUploadCardProps {
    title: string;
    description: string;
    icon: 'FILE' | 'CHESS_FILE';
    onError?: (message: string) => void;
    onFileSelect: ({ file, type }: { file: File, type: 'PGN' | 'OTHER' }) => void;
}

export function FileUploadCard({
    title,
    description,
    icon,
    onError,
    onFileSelect
}: FileUploadCardProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileSelected, setFileSelected] = useState<boolean>(false);


    const handleFileSelect = async (file: File) => {
        if (!file) {
            onError?.("No file selected.");
            return;
        }

        if (file.size === 0) {
            onError?.("The file is empty.");
            return;
        }
        
        if (icon === 'FILE' && file.size > MAX_SIZE_FILE) {
            onError?.(`The file is too large. Maximum allowed size: ${MAX_SIZE_FILE / 1024} KB.`);
            return;
        };

        onFileSelect({ 
            file, 
            type: icon === 'CHESS_FILE' ? 'PGN' : 'OTHER' 
        });
        setFileSelected(true);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    };

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };


    return (
        <div className="w-full max-w-md">
            <div className="glass rounded-t-xl border-t-2 border-l-2 border-r-2 border-[#ffffff11] p-3">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
            <div>
                <div 
                    className={
                        `glass file-drop-zone 
                        ${ 
                            isDragging || fileSelected ? 
                            'border-accent! shadow-[0_0_30px_var(--color-accent-2)]!' : ''
                        }
                    `}
                    
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <input
                        ref={fileInputRef}
                        className="hidden"
                        type="file"
                        id="InputEncrypt"
                        accept={icon === 'CHESS_FILE' ? '.pgn, .zip' : '*'}
                        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                    />

                    <div className="flex flex-row items-center justify-center gap-6">
                        {icon === 'FILE' && (
                            <svg className="w-12 h-auto opacity-50" width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M416 221.25V416C416 428.73 410.943 440.939 401.941 449.941C392.939 458.943 380.73 464 368 464H144C131.27 464 119.061 458.943 110.059 449.941C101.057 440.939 96 428.73 96 416V96C96 83.2696 101.057 71.0606 110.059 62.0589C119.061 53.0571 131.27 48 144 48H242.75C251.234 48.0013 259.37 51.3716 265.37 57.37L406.63 198.63C412.628 204.63 415.999 212.766 416 221.25Z" stroke="#d2d5db" strokeWidth="32" strokeLinejoin="round"/>
                                <path d="M256 56V176C256 184.487 259.371 192.626 265.373 198.627C271.374 204.629 279.513 208 288 208H408" stroke="#d2d5db" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M176 288H336" stroke="#d2d5db" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M176 368H336" stroke="#d2d5db" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        )}

                        {icon === 'CHESS_FILE' && (
                            <svg aria-hidden="true" className="w-12 h-auto opacity-50" width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M416 221.25V416C416 428.73 410.943 440.939 401.941 449.941C392.939 458.943 380.73 464 368 464H144C131.27 464 119.061 458.943 110.059 449.941C101.057 440.939 96 428.73 96 416V96C96 83.2696 101.057 71.0606 110.059 62.0589C119.061 53.0571 131.27 48 144 48H242.75C251.234 48.0013 259.37 51.3716 265.37 57.37L406.63 198.63C412.628 204.63 415.999 212.766 416 221.25Z" stroke="#d2d5db" strokeWidth="32" strokeLinejoin="round"/>
                                <path d="M256 56V176C256 184.487 259.371 192.626 265.373 198.627C271.374 204.629 279.513 208 288 208H408" stroke="#d2d5db" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M215.512 388.451H296.111C296.111 388.451 301.623 387.365 301.623 381.945C301.623 373.811 294.143 370.844 290.6 366.219C275.64 347.445 276.73 301.732 276.73 301.732H234.893C234.893 301.732 235.983 347.445 221.016 366.219C217.48 370.844 210 373.811 210 381.945C210 387.365 215.512 388.451 215.512 388.451Z" fill="#d2d5db"/>
                                <path d="M276.729 296.02L289.784 287.855V265H274.177V277.408H263.154V265H248.461V277.408H237.445V265H221.831V287.855L234.893 296.02H276.729Z" fill="#d2d5db"/>
                                <path d="M215.512 394.164L211.02 401.728V411.521H300.604V401.728L296.112 394.164H215.512Z" fill="#d2d5db"/>
                            </svg>
                        )}


                        <div className="text-left">
                            <p className="text-gray-300 font-medium mb-1">Drag your file here</p>
                            <p className="text-gray-500 text-sm">or click to select</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}