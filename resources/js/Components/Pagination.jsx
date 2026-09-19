import { Link } from '@inertiajs/react';

export default function Pagination({ links }) {
    if (!links || links.length <= 3) return null; // Only Previous and Next

    return (
        <div className="flex flex-wrap justify-center gap-1 mt-6 mb-4">
            {links.map((link, index) => {
                const isActive = link.active;
                const isDisabled = link.url === null;

                let label = link.label
                    .replace('&laquo;', '«')
                    .replace('&raquo;', '»')
                    .replace('Previous', '«')
                    .replace('Next', '»');

                if (isDisabled) {
                    return (
                        <div
                            key={index}
                            className="px-3 py-2 text-sm font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-lg cursor-not-allowed"
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                }

                return (
                    <Link
                        key={index}
                        href={link.url}
                        className={`px-3 py-2 text-sm font-bold border rounded-lg transition-colors ${
                            isActive
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-indigo-600'
                        }`}
                        dangerouslySetInnerHTML={{ __html: label }}
                    />
                );
            })}
        </div>
    );
}
