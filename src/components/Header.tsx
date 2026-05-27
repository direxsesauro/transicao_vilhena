import React from 'react';
import { Sun, Moon, Database, Activity, Landmark, ShieldCheck, HeartPulse } from 'lucide-react';

interface HeaderProps {
  activeSection: string;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  totalRepasses: number;
  totalMaisSaude: number;
  totalFiles: number;
  isSupabaseActive: boolean;
}

export default function Header({
  activeSection,
  isDarkMode,
  onThemeToggle,
  totalRepasses,
  totalMaisSaude,
  totalFiles,
  isSupabaseActive
}: HeaderProps) {
  // Traduzir seção para exibição
  const getSectionTitle = () => {
    switch (activeSection) {
      case 'repasses':
        return 'Repasses do Termo de Cooperação';
      case 'mais_saude':
        return 'Programa Mais Saúde';
      case 'downloads':
        return 'Central de Documentos & Downloads';
      case 'supabase':
        return 'Integração com Supabase';
      default:
        return 'Visão Geral';
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <header id="app-header" className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-colors duration-300 dark:border-slate-800/80 dark:bg-slate-900/95">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="flex items-center gap-2 font-sans text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            <HeartPulse className="h-5 w-5 text-emerald-500 animate-pulse" />
            {getSectionTitle()}
          </h1>
          <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
            {/* Vilhena - Rondônia • Termo de Cooperação */}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Status do Supabase */}
          <div
            id="supabase-status-badge"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${isSupabaseActive
              ? 'bg-emerald-50/85 border-emerald-200 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-400'
              : 'bg-amber-50/85 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-400'
              }`}
            title={isSupabaseActive ? 'Conectado ao Supabase Live' : 'Operando em Modo de Cache Local'}
          >
            <Database className={`h-3.5 w-3.5 ${isSupabaseActive ? 'text-emerald-500' : 'text-amber-500'}`} />
            <span>{isSupabaseActive ? 'Supabase Ativo' : 'Banco Local'}</span>
          </div>

          {/* Botão Tema */}
          <button
            id="theme-toggle-btn"
            onClick={onThemeToggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 text-slate-600 shadow-sm transition-all hover:bg-slate-100 active:scale-95 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Alternar tema escuro/claro"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-emerald-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Mini-Cards de Estatísticas Rápidas no topo de todas as páginas */}
      <div className="grid grid-cols-1 gap-px bg-slate-100 border-t border-slate-200/80 dark:bg-slate-800/80 dark:border-slate-800/80 sm:grid-cols-3">
        <div className="flex items-center justify-between bg-white px-6 py-3.5 transition-colors dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Landmark className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Repasses</p>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">{formatCurrency(totalRepasses)}</h4>
            </div>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono dark:bg-slate-800 dark:text-slate-400">Estado</span>
        </div>

        <div className="flex items-center justify-between bg-white px-6 py-3.5 transition-colors dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Mais Saúde</p>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">{formatCurrency(totalMaisSaude)}</h4>
            </div>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono dark:bg-slate-800 dark:text-slate-400">Programa</span>
        </div>

        <div className="flex items-center justify-between bg-white px-6 py-3.5 transition-colors dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-teal-50 p-2 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Documentação em PDF</p>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">{totalFiles} {totalFiles === 1 ? 'arquivo' : 'arquivos'}</h4>
            </div>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono dark:bg-slate-800 dark:text-slate-400">Transparência</span>
        </div>
      </div>
    </header>
  );
}
