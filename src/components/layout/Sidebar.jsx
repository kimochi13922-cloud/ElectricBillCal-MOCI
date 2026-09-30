export function Sidebar({ isSidebarOpen, activeTab, setActiveTab }) {
  return (
    <aside
      className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-black/60 backdrop-blur-xl border-r border-orange-900/50 shadow-2xl flex flex-col pt-20 md:pt-10 transition-transform duration-300 z-40
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden md:border-none'}`}
    >
      {/* Brand */}
      <div className={`px-6 mb-10 text-center ${!isSidebarOpen && 'md:hidden'}`}>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent">
          MOCI Orbit
        </h2>
        <p className="text-xs text-orange-200 mt-1 opacity-70 tracking-widest uppercase">Electricity</p>
      </div>

      {/* Nav */}
      <nav className={`flex flex-col gap-2 px-4 ${!isSidebarOpen && 'md:hidden'}`}>
        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 text-sm ${
            activeTab === 'calculator'
              ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(255,102,0,0.4)] shadow-orange-500/20 translate-x-2'
              : 'text-orange-200/70 hover:bg-white/5 hover:text-orange-100 hover:translate-x-1'
          }`}
        >
          <span className="text-xl">🧮</span> เครื่องคำนวณ
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 text-sm ${
            activeTab === 'stats'
              ? 'bg-orange-600 text-white shadow-[0_0_15px_rgba(255,102,0,0.4)] shadow-orange-500/20 translate-x-2'
              : 'text-orange-200/70 hover:bg-white/5 hover:text-orange-100 hover:translate-x-1'
          }`}
        >
          <span className="text-xl">📊</span> สถิติย้อนหลัง
        </button>
      </nav>
      
      {/* Footer / Spooky elements in sidebar */}
      <div className={`mt-auto mb-10 px-6 text-center opacity-30 text-4xl ${!isSidebarOpen && 'md:hidden'}`}>
        🦇 🎃 👻
      </div>
    </aside>
  );
}
