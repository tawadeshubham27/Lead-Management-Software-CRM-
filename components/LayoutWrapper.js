'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function LayoutWrapper({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: '📊' },
    { label: 'Leads', path: '/leads', icon: '👥' },
    { label: 'Test WhatsApp', path: '/test-whatsapp', icon: '💬' },
    { label: 'Demo', path: '/demo', icon: '💡' },
  ];

  // Don't show layout on login/register/demo pages
  if (pathname === '/login' || pathname === '/register' || pathname === '/demo') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen w-full bg-gray-50 text-gray-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm" 
          onClick={toggleSidebar} 
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static
      `}>
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <span className="text-2xl">📈</span>
          <h2 className="text-xl font-bold text-indigo-600 tracking-tight">AgencyCRM</h2>
        </div>
        
        <nav className="p-4 flex flex-col gap-2 flex-1">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors
                ${pathname === item.path 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Sign out button at bottom of sidebar */}
        {session && (
          <div className="p-4 border-t border-gray-200">
            <div className="text-sm text-gray-500 mb-2 px-2 truncate">
              {session.user?.name || session.user?.email}
            </div>
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })} 
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-medium transition-colors text-sm"
            >
              <span>🚪</span> Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-gray-500 hover:text-gray-900 text-2xl" 
              onClick={toggleSidebar}
            >
              ☰
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
              {navItems.find(item => item.path === pathname)?.label || 'CRM'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {session && (
              <span className="text-sm text-gray-500 hidden sm:block">
                {session.user?.name}
              </span>
            )}
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
              {session?.user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>
        <div className="p-4 md:p-8 flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
