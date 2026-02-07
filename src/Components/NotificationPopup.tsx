import { useCallback, useEffect, useState } from 'react';


interface ErrorPopupProps {
    message: string;
    onClose: () => void;
    style: 'error' | 'success';
}


export function NotificationPopup({ message, onClose, style }: ErrorPopupProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    const handleClose = useCallback(() => {
        setIsLeaving(true);
        setTimeout(() => {
            onClose();
        }, 300);
    }, [onClose]);

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 10);

        const timer = setTimeout(() => {
            handleClose();
        }, 10000);

        return () => clearTimeout(timer);
    }, [handleClose]);

    
    return (
        <div
            className={`
                fixed top-6 right-6 z-50 transform transition-all duration-300 ease-out 
                ${isVisible && !isLeaving
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-full opacity-0'
                }
            `}
        >
            <div className={`glass rounded-xl p-4 pr-12 max-w-sm border shadow-2xl ${style === 'error' ? 'border-red-500/30' : 'border-green-500/30'}`}
                style={{ boxShadow: style === 'error' ? '0 8px 32px rgba(239, 68, 68, 0.3)' : '0 8px 32px rgba(34, 197, 94, 0.3)' }}
            >
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${style === 'error' ? 'from-red-500 to-rose-600' : 'from-green-500 to-lime-600'} flex items-center justify-center shrink-0`}>
                        {style === 'error' ? (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5 text-white" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M256 448C249.577 447.992 243.305 446.051 238 442.43C159.41 389.08 125.38 352.5 106.61 329.63C66.6104 280.88 47.4604 230.83 48.0004 176.63C48.6304 114.52 98.4604 64 159.08 64C203.16 64 233.69 88.83 251.47 109.51C252.034 110.158 252.729 110.679 253.511 111.035C254.293 111.391 255.141 111.576 256 111.576C256.859 111.576 257.708 111.391 258.49 111.035C259.271 110.679 259.967 110.158 260.53 109.51C278.31 88.81 308.84 64 352.92 64C413.54 64 463.37 114.52 464 176.64C464.54 230.85 445.37 280.9 405.39 329.64C386.62 352.51 352.59 389.09 274 442.44C268.694 446.058 262.422 447.995 256 448Z" fill="white"/>
                            </svg>
                        )}
                    </div>

                    {/* Content */}
                    <div className='w-52'>
                        <h4 className="text-white font-semibold text-sm">{style === 'error' ? 'Error' : 'Success'}</h4>
                        <p className="text-gray-400 text-sm mt-0.5">{message}</p>
                    </div>
                </div>

                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors"
                >
                    <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Progress bar for auto-close */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b-2xl overflow-hidden">
                    <div
                        className={`h-full bg-linear-to-r ${style === 'error' ? 'from-red-500 to-rose-600' : 'from-green-500 to-lime-600'} rounded-b-2xl`}
                        style={{
                            animation: 'shrink 10s linear forwards',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
