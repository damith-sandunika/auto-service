import { Link } from '@inertiajs/react';

export default function Pagination({ links, from, to, total, paginator }) {
    const actualLinks = links || paginator?.links;
    const actualFrom = from ?? paginator?.from;
    const actualTo = to ?? paginator?.to;
    const actualTotal = total ?? paginator?.total;

    if (!actualLinks || actualLinks.length <= 1) return null;

    const hasInfo = actualTotal !== undefined && actualTotal !== null;

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 mt-2">
            {/* Results count text: e.g. Showing 1 to 15 of 35 results */}
            <div className="text-xs sm:text-sm font-semibold text-slate-500">
                {hasInfo ? (
                    actualTotal > 0 ? (
                        <span>
                            Showing <span className="font-black text-slate-800">{actualFrom ?? 1}</span> to{' '}
                            <span className="font-black text-slate-800">{actualTo ?? actualTotal}</span> of{' '}
                            <span className="font-black text-indigo-600">{actualTotal}</span> results
                        </span>
                    ) : (
                        <span>Showing 0 results</span>
                    )
                ) : (
                    <span>Page navigation</span>
                )}
            </div>

            {/* Pagination Button Links */}
            {actualLinks.length > 3 && (
                <div className="flex flex-wrap items-center justify-center gap-1">
                    {actualLinks.map((link, index) => {
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
                                    className="px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-300 bg-slate-50 border border-slate-200/60 rounded-lg cursor-not-allowed select-none"
                                    dangerouslySetInnerHTML={{ __html: label }}
                                />
                            );
                        }

                        return (
                            <Link
                                key={index}
                                href={link.url}
                                preserveScroll
                                className={`px-3 py-1.5 text-xs sm:text-sm font-bold border rounded-lg transition-all ${
                                    isActive
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-indigo-600'
                                }`}
                                dangerouslySetInnerHTML={{ __html: label }}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
