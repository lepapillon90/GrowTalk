/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: 'export', // Reverted for Vercel
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        // unoptimized: true, // Reverted for Vercel
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
            },
        ],
    },
};

import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
    dest: "public",
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    swcMinify: false,
    disable: false, // process.env.NODE_ENV === "development", // Enable in dev for testing if needed, or disable. User wants PWA support implemented. Let's enable it but maybe comment out disable line to force enable or use dev mode logic. Better to keep disable: process.env.NODE_ENV === "development" for real app, but for verifying "PWA Offline Support" now, I might want to test it.
    // Actually, usually we want to verify in dev server?
    // But next-pwa often causes issues in dev hot reload.
    // Let's set disable: process.env.NODE_ENV === "development" for stability, and assume user will build for test.
    // Or just set disable: false to verify now.
    disable: process.env.NODE_ENV === "development",
    workboxOptions: {
        disableDevLogs: true,
    },
});

// export default withPWA(nextConfig);
export default nextConfig;
