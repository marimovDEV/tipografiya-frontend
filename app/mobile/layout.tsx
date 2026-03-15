export default function MobileLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 pb-20">
            {/* Mobile Header */}
            <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10">
                <h1 className="text-lg font-bold text-center">PrintERP Mobile</h1>
            </header>

            {/* Main Content */}
            <main className="p-4">
                {children}
            </main>

            {/* Mobile Bottom Nav (Simple version) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 flex justify-around z-10">
                <a href="/mobile" className="flex flex-col items-center gap-1 text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    <span className="text-xs">Home</span>
                </a>
                <a href="/mobile/tasks" className="flex flex-col items-center gap-1 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="m9 16 2 2 4-4" /></svg>
                    <span className="text-xs">Tasks</span>
                </a>
                <a href="/mobile/scan" className="flex flex-col items-center gap-1 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /></svg>
                    <span className="text-xs">Scan</span>
                </a>
            </nav>
        </div>
    )
}
