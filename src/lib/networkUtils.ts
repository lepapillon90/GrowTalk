/**
 * Network utility functions for detecting online/offline status
 */

export const isOnline = (): boolean => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
};

export const waitForOnline = (): Promise<void> => {
    return new Promise((resolve) => {
        if (isOnline()) {
            resolve();
            return;
        }

        const handleOnline = () => {
            window.removeEventListener('online', handleOnline);
            resolve();
        };

        window.addEventListener('online', handleOnline);
    });
};

export const onNetworkChange = (callback: (online: boolean) => void) => {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
};
