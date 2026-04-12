'use client';

import { useSidebar } from "./SidebarContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarOpen, toggleSidebar } = useSidebar();

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        flex: 1, 
        minWidth: 0, 
        height: '100vh', 
        overflow: 'hidden',
        transition: 'all 0.3s ease',
      }}>
        <Topbar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main style={{ 
          flex: 1, 
          padding: '24px', 
          overflowY: 'auto',
          height: 'calc(100vh - 60px)',
          background: '#080808'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
