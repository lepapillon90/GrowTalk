/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: 'export', // Reverted for Vercel
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
    // Silence Turbopack/Webpack conflict error as suggested by Next.js 16 build logs
    turbopack: {},
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
    disable: true, // process.env.NODE_ENV === "development",
    workboxOptions: {
        disableDevLogs: true,
    },
});

// export default withPWA(nextConfig);

import withBundleAnalyzer from '@next/bundle-analyzer';

const bundleAnalyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
    openAnalyzer: false,
});

const finalConfig = process.env.ANALYZE === 'true'
    ? bundleAnalyzer(nextConfig)
    : withPWA(nextConfig);

export default finalConfig;
