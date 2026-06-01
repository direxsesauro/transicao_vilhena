import React from 'react';
import { Coins, FileSpreadsheet, Download, Database, Shield, Flame, Activity } from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isSupabaseActive: boolean;
}

export default function Sidebar({
  activeSection,
  setActiveSection,
  isSupabaseActive
}: SidebarProps) {
  const menuItems = [
    {
      id: 'repasses',
      label: 'Termo de Cooperação',
      description: 'Financiamento do Contrato de Gestão',
      icon: Coins,
      color: 'text-blue-500 dark:text-blue-400',
      activeBg: 'bg-blue-50 text-blue-700 border-blue-500 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-400'
    },
    {
      id: 'mais_saude',
      label: 'Mais Saúde Vilhena',
      description: 'Cirurgias Eletivas',
      icon: Activity,
      color: 'text-emerald-500 dark:text-emerald-400',
      activeBg: 'bg-emerald-50 text-emerald-700 border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-400'
    },
    {
      id: 'downloads',
      label: 'Contratos e Documentos',
      description: 'Downloads de PDFs',
      icon: Download,
      color: 'text-teal-500 dark:text-teal-400',
      activeBg: 'bg-teal-50 text-teal-700 border-teal-500 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-400'
    }
  ];

  return (
    <aside id="sidebar-navigation" className="hidden w-72 flex-col border-r border-slate-200 bg-white/90 backdrop-blur-md transition-all duration-300 dark:border-slate-800 dark:bg-slate-950/50 md:flex">
      {/* Brand Logo Header */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-6 dark:border-slate-900">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 p-0.5 shadow-md shadow-emerald-500/10">
          <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-white dark:bg-slate-900">
            <Activity className="h-5 w-5 bg-gradient-to-tr from-blue-600 to-emerald-500 bg-clip-text text-transparent" />
          </div>
        </div>
        <div>
          <h2 className="font-sans text-sm font-bold tracking-tight text-slate-800 dark:text-white leading-none">
            Transição de Gestão
          </h2>
          <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
            Hospital Regional de Vilhena
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 space-y-2 p-4">
        <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-3">
          MENU PRINCIPAL
        </span>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              id={`nav-item-${item.id}`}
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`group flex w-full items-center gap-4.5 rounded-xl border-l-[3px] px-3.5 py-3 text-left transition-all duration-200 outline-none ${isActive
                ? `${item.activeBg} font-medium shadow-sm shadow-black/[0.02]`
                : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/40 dark:hover:text-slate-200'
                }`}
            >
              <div className={`rounded-lg p-1.5 transition-colors duration-200 ${isActive ? 'bg-white/40 dark:bg-black/30' : 'bg-slate-50 group-hover:bg-slate-150 dark:bg-slate-900'
                }`}>
                <IconComponent className={`h-4.5 w-4.5 ${item.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold leading-tight">{item.label}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer info card */}
      <div className="border-t border-slate-100 p-4 dark:border-slate-900">
        <div className="rounded-xl bg-slate-50 p-3.5 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-900/50">
          <div className="flex gap-2.5">
            <Shield className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                Portal Transparência
              </p>
              <p className="text-[9px] text-slate-500 dark:text-slate-500 mt-1">
                Dados oficiais em conformidade com a Lei de Acesso à Informação (LAI nº 12.527).
              </p>
            </div>
          </div>
          <div className="mt-3.5 flex items-center justify-between border-t border-slate-200/50 pt-2.5 dark:border-slate-800/50">
            <span className="text-[8px] bg-slate-200/60 text-slate-600 px-1.5 py-0.5 rounded font-mono dark:bg-slate-800 dark:text-slate-400">
              V. 1.2
            </span>
            <div className="flex gap-1">
              <span className="h-1.5 w-2.5 bg-[#4B92DB] inline-block rounded-xs"></span>
              <span className="h-1.5 w-2.5 bg-[#F9E154] inline-block rounded-xs"></span>
              <span className="h-1.5 w-2.5 bg-[#46A257] inline-block rounded-xs"></span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
