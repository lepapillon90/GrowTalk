import BottomTabBar from "@/components/layout/BottomTabBar";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <main className="flex-1 overflow-y-auto scrollbar-hide pb-16 bg-bg">
                {children}
            </main>
            <BottomTabBar />
        </>
    );
}
