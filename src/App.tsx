import { useCallback, useState } from "react";
import { ChessBackground } from "./Components/ChessBackground";
import { NotificationPopup } from "./Components/NotificationPopup";
import { FileUploadCard } from "./Components/FileUploadCard";
import { TreatmentFilePGN } from "./Components/TreatmentFilePGN";
import { TreatmentFileOther } from "./Components/TreatmentFileOther";


function App() {
    const [notifications, setNotifications] = useState<{ id: number; message: string, style: 'error' | 'success' }[]>([]);
    const [file, setFile] = useState<{ file: File, type: 'PGN' | 'OTHER' } | null>(null);
    const [step, setStep] = useState<'UPLOAD' | 'TREATMENT'>('UPLOAD');
    

    const addNotification = useCallback((message: string, style: 'error' | 'success' = 'error') => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, message, style }]);
    }, []);

    const removeNotification = useCallback((id: number) => {
        setNotifications((prev) => prev.filter((e) => e.id !== id));
    }, []);


    const onReset = () => {
        setFile(null);
        setStep('UPLOAD');
    }
    

    return (
        <>
            {/* Background */}
            <ChessBackground />


            {/* Header */}
            <div className="flex flex-col items-center flex-nowrap mt-16 lg:mt-24 absolute top-8 left-1/2 -translate-x-1/2">
                <h1 aria-label="Check-MateData" className="text-3xl sm:text-4xl lg:text-5xl w-screen text-center font-bold text-white tracking-tight mb-2">
                    <span className="noSelect mr-1.5" aria-hidden="true">♛</span>

                    Check-Mate
                    <span className="text-transparent bg-[#a45bff] bg-clip-text">
                        Data
                    </span>
                    
                    <span className="noSelect ml-1.5" aria-hidden="true">♚</span>
                </h1>
                <div className="text-gray-400 text-sm sm:text-base md:text-lg max-w-md mx-auto text-center ">
                    Transform your files into chess games!
                </div>
            </div>


            {/* File Upload & Treatment */}
            <div 
                className={`flex flex-row transition-transform duration-500 ease-in-out delay-500 mt-36
                    ${step === 'UPLOAD' ? 'translate-x-1/4' : '-translate-x-1/4'}
                `}
            >
                <div className="w-screen flex flex-col lg:flex-row gap-6 justify-center items-center">
                    <FileUploadCard
                        title="File to PGN"
                        description="Select a file to convert it to PGN chess game format."
                        icon="FILE"
                        onNotification={addNotification}
                        onFileSelect={(selectedFile) => {
                            setFile(selectedFile);
                            setStep('TREATMENT');
                        }}
                    />
                    
                    <div className="hidden lg:flex flex-col items-center gap-2 px-4 relative">
                        <div className="w-px h-16 bg-linear-to-b from-transparent to-gray-600"></div>
                        <div className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                            </svg>
                        </div>
                        <div className="w-px h-16 bg-linear-to-b from-gray-600 to-transparent"></div>
                    </div>

                    <div className="w-full lg:hidden relative flex flex-col items-center">
                        <div className="lg:hidden flex items-center gap-4 w-full max-w-md">
                            <div className="flex-1 h-px bg-linear-to-r from-transparent to-gray-600"></div>
                            <span className="text-[#868686] text-sm uppercase">
                                OR
                            </span>
                            <div className="flex-1 h-px bg-linear-to-r from-gray-600 to-transparent"></div>
                        </div>
                    </div>

                    <FileUploadCard 
                        title="PGN to file"
                        description="Select a PGN chess game file to convert it back to the original file."
                        icon="CHESS_FILE"
                        onNotification={addNotification}
                        onFileSelect={(selectedFile) => {
                            setFile(selectedFile);
                            setStep('TREATMENT');
                        }}
                    />
                </div>

                <div className="w-screen flex flex-col lg:flex-row gap-6 justify-center items-center">
                    {file && file.type === 'PGN' && (
                        <TreatmentFilePGN file={file.file} onReset={onReset} onNotification={addNotification} />
                    )}

                    {file && file.type === 'OTHER' && (
                        <TreatmentFileOther file={file.file} onReset={onReset} onNotification={addNotification} />
                    )}
                </div>
            </div>


            {/* Notifications Popups */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {notifications.map((notification, index) => (
                    <div key={notification.id} style={{ transform: `translateY(${index * 10}px)` }}>
                        <NotificationPopup
                            message={notification.message}
                            onClose={() => removeNotification(notification.id)}
                            style={notification.style}
                        />
                    </div>
                ))}
            </div>


            {/* GitHub Link */}
            <a href="https://github.com/CapyBlaze/Check-MateData" target="_blank" rel="noopener noreferrer">
                <div className="opacity-50 hover:opacity-80 absolute bottom-4 right-4 cursor-pointer transition-all duration-300">
                    <svg className="h-9 w-auto" width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M256 32C132.3 32 32 134.9 32 261.7C32 363.2 96.2 449.2 185.2 479.6C186.448 479.871 187.723 480.005 189 480C197.3 480 200.5 473.9 200.5 468.6C200.5 463.1 200.3 448.7 200.2 429.5C192.79 431.237 185.21 432.143 177.6 432.2C134.5 432.2 124.7 398.7 124.7 398.7C114.5 372.2 99.8 365.1 99.8 365.1C80.3 351.4 99.7 351 101.2 351H101.3C123.8 353 135.6 374.8 135.6 374.8C146.8 394.4 161.8 399.9 175.2 399.9C184.06 399.723 192.784 397.678 200.8 393.9C202.8 379.1 208.6 369 215 363.2C165.3 357.4 113 337.7 113 249.7C113 224.6 121.7 204.1 136 188.1C133.7 182.3 126 158.9 138.2 127.3C139.836 126.908 141.518 126.74 143.2 126.8C151.3 126.8 169.6 129.9 199.8 150.9C236.495 140.633 275.305 140.633 312 150.9C342.2 129.9 360.5 126.8 368.6 126.8C370.282 126.74 371.964 126.908 373.6 127.3C385.8 158.9 378.1 182.3 375.8 188.1C390.1 204.2 398.8 224.7 398.8 249.7C398.8 337.9 346.4 357.3 296.5 363C304.5 370.1 311.7 384.1 311.7 405.5C311.7 436.2 311.4 461 311.4 468.5C311.4 473.9 314.5 480 322.8 480C324.144 480.006 325.484 479.872 326.8 479.6C415.9 449.2 480 363.1 480 261.7C480 134.9 379.7 32 256 32Z" fill="white"/>
                    </svg>
                </div>
            </a>
        </>
    )
}

export default App
