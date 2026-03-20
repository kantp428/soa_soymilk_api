'use client';

import { Bell, Search, UserCircle } from 'lucide-react';

export function AdminHeader() {
  return (
    <header className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between sticky top-0 z-10 flex-shrink-0 shadow-sm">
      <div className="flex items-center flex-1">
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-9 pr-4 py-2 bg-zinc-100 border-transparent rounded-full text-sm focus:bg-white focus:border-zinc-300 focus:ring-2 focus:ring-zinc-200 transition-all outline-none"
          />
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="h-6 w-px bg-zinc-200" />
        <button className="flex items-center gap-2 hover:bg-zinc-50 py-1 px-2 rounded-lg transition-colors">
          <UserCircle className="w-8 h-8 text-zinc-400" />
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-zinc-700 leading-tight">Admin User</p>
            <p className="text-xs text-zinc-500">Manager</p>
          </div>
        </button>
      </div>
    </header>
  );
}
