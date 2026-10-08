import React from 'react';
import { Link } from '@inertiajs/react';
import { BuildingOfficeIcon } from '@heroicons/react/24/outline';

export default function OnboardingCard() {
    return (
        <div className="flex justify-center py-10 px-4 animate-slide-up">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200 p-8 md:p-12 w-full max-w-lg text-center shadow-xl shadow-slate-200/50 mt-10">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-6 ring-8 ring-indigo-50/50">
                    <BuildingOfficeIcon className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Welcome to AutoService!</h3>
                <p className="text-[14px] font-medium text-slate-500 mb-8 leading-relaxed">
                    You have successfully registered your company. To get started and view your dashboard metrics, you need to create your first Garage Branch.
                </p>
                
                <Link 
                    href={route('owner.settings.index')} 
                    className="inline-block w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-extrabold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all duration-300"
                >
                    Setup My First Branch
                </Link>
            </div>
        </div>
    );
}
