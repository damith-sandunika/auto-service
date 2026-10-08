import { Head, Link } from '@inertiajs/react';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="bg-gray-50 text-black/50 dark:bg-black dark:text-white/50 min-h-screen flex flex-col justify-center items-center">
                <header className="absolute top-0 w-full p-6 flex justify-end">
                    <nav className="-mx-3 flex flex-1 justify-end">
                        {auth.user ? (
                            <Link href={route('dashboard')} className="rounded-md px-3 py-2 text-black transition hover:text-black/70 dark:text-white dark:hover:text-white/80">Dashboard</Link>
                        ) : (
                            <>
                                <Link href={route('login')} className="rounded-md px-3 py-2 text-black transition hover:text-black/70 dark:text-white dark:hover:text-white/80">Log in</Link>
                                <Link href={route('register')} className="rounded-md px-3 py-2 text-black transition hover:text-black/70 dark:text-white dark:hover:text-white/80">Register</Link>
                            </>
                        )}
                    </nav>
                </header>

                <main className="text-center p-8 bg-white dark:bg-zinc-900 shadow-2xl rounded-3xl max-w-lg w-full">
                    <h1 className="text-4xl font-black text-slate-800 dark:text-white mb-2">Welcome to GarageSaaS</h1>
                    <p className="text-slate-500 mb-8 font-medium">Manage your auto service business efficiently.</p>
                    
                    {auth.user ? (
                        <Link href={route('dashboard')} className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all">Go to Dashboard</Link>
                    ) : (
                        <div className="flex gap-4 justify-center">
                            <Link href={route('login')} className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all">Login</Link>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
