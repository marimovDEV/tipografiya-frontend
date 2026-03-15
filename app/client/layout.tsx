import Link from "next/link"

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Simple Header */}
            <header className="bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/client/orders">
                        <h1 className="text-2xl font-bold text-primary">PrintERP</h1>
                    </Link>

                    <nav className="flex items-center gap-6">
                        <Link
                            href="/client/orders"
                            className="text-sm font-medium hover:text-primary transition-colors"
                        >
                            Buyurtmalar
                        </Link>
                        <Link
                            href="/auth/login"
                            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                        >
                            Chiqish
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="py-6">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-white border-t mt-12">
                <div className="max-w-7xl mx-auto px-6 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        © 2026 PrintERP. Barcha huquqlar himoyalangan.
                    </p>
                </div>
            </footer>
        </div>
    )
}
