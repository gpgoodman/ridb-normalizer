export default function HomePage() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
            <div className="max-w-3xl w-full">
                <h1 className="text-3xl md:text-4xl font-semibold mb-4">
                    RIDB Normalizer
                </h1>

                <p className="text-slate-300 mb-4">
                    RIDB Normalizer is a Next.js + TypeScript service that fetches raw
                    campground data from the Recreation Information Database (RIDB),
                    validates it with Zod, and returns clean, normalized JSON that&apos;s
                    ready for use in applications like Campvue and AI assistants.
                </p>

                <p className="text-slate-400 mb-6">
                    This project demonstrates production-style API design, schema
                    validation, error handling, and auto-generated OpenAPI documentation
                    via Swagger UI.
                </p>

                <div className="flex flex-wrap gap-3">
                    <a
                        href="/docs"
                        className="inline-flex items-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition"
                    >
                        View API Docs (Swagger)
                    </a>

                    <a
                        href="https://github.com/gpgoodman/ridb-normalizer"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-md border border-slate-500 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 transition"
                    >
                        View Source on GitHub
                    </a>
                </div>

                <div className="mt-8 text-xs text-slate-500 space-y-1">
                    <p>Tech stack: Next.js 16 · TypeScript · Zod · Swagger UI</p>
                    <p>Use /docs to explore endpoints and try live RIDB normalization.</p>
                </div>
            </div>
        </main>
    );
}
