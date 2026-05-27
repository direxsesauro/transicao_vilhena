import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Plus, 
  Trash2, 
  Calendar, 
  DollarSign, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Search, 
  FileDown, 
  AlertCircle,
  Edit
 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { MaisSaude } from '../types';

interface MaisSaudeSectionProps {
  data: MaisSaude[];
  onAdd: (mes_ano: string, valor: number, observacoes: string) => Promise<void>;
  onUpdate: (id: string, mes_ano: string, valor: number, observacoes: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
}

export default function MaisSaudeSection({
  data,
  onAdd,
  onUpdate,
  onDelete,
  isLoading,
}: MaisSaudeSectionProps) {
  // Estados para o formulário
  const [selectedMonth, setSelectedMonth] = useState('05');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [valorInput, setValorInput] = useState('');
  const [obsInput, setObsInput] = useState('');
  
  // Estado para filtros e visuais
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [searchTerm, setSearchTerm] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState('');
  const [editMonth, setEditMonth] = useState('05');
  const [editYear, setEditYear] = useState('2026');
  const [editValor, setEditValor] = useState('');
  const [editObs, setEditObs] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Anos de 2024 a 2027
  const years = ['2024', '2025', '2026', '2027'];
  const months = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  // Ordenação cronológica dos dados para o gráfico
  const sortedChartData = useMemo(() => {
    return [...data].sort((a, b) => a.mes_ano.localeCompare(b.mes_ano));
  }, [data]);

  // Formatação dos meses para o gráfico (Ex: "Jan/25")
  const formattedChartData = useMemo(() => {
    return sortedChartData.map(item => {
      const [year, month] = item.mes_ano.split('-');
      const monthNamesAbbr: { [key: string]: string } = {
        '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
        '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
      };
      return {
        ...item,
        name: `${monthNamesAbbr[month]}/${year.substring(2)}`,
        'Mais Saúde (R$)': item.valor
      };
    });
  }, [sortedChartData]);

  // Ordenação reversa (mais recente primeiro) para a tabela
  const filteredTableData = useMemo(() => {
    return data
      .filter(item => {
        const valueStr = item.valor.toString();
        const obsLower = item.observacoes.toLowerCase();
        const mesAnoStr = item.mes_ano;
        const query = searchTerm.toLowerCase();
        return valueStr.includes(query) || obsLower.includes(query) || mesAnoStr.includes(query);
      })
      .sort((a, b) => b.mes_ano.localeCompare(a.mes_ano));
  }, [data, searchTerm]);

  // Estatísticas calculadas
  const stats = useMemo(() => {
    if (data.length === 0) return { total: 0, media: 0, max: 0, count: 0 };
    const total = data.reduce((acc, curr) => acc + curr.valor, 0);
    const media = total / data.length;
    const max = Math.max(...data.map(d => d.valor));
    return {
      total,
      media,
      max,
      count: data.length
    };
  }, [data]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMsg('');

    const numericVal = parseFloat(editValor.replace(/\./g, '').replace(',', '.'));
    if (isNaN(numericVal) || numericVal <= 0) {
      setSubmitError('Por favor, informe um valor numérico válido e maior que zero.');
      return;
    }

    const compiledMesAno = `${editYear}-${editMonth}`;
    try {
      await onUpdate(editId, compiledMesAno, numericVal, editObs || 'Sem observações adicionais');
      setSuccessMsg('Investimento Mais Saúde atualizado com sucesso!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setEditOpen(false);
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao atualizar o investimento.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMsg('');
    const numericVal = parseFloat(valorInput.replace(/\./g, '').replace(',', '.'));
    if (isNaN(numericVal) || numericVal <= 0) {
      setSubmitError('Por favor, informe um valor numérico válido e maior que zero.');
      return;
    }
    const compiledMesAno = `${selectedYear}-${selectedMonth}`;
    try {
      await onAdd(compiledMesAno, numericVal, obsInput);
      setSuccessMsg('Investimento cadastrado com sucesso!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setFormOpen(false);
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao cadastrar o investimento.');
    }
  };

  // Exportar dados para CSV
  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Mes/Ano,Fomento (R$),Data Cadastro,Observações"].join(",") + "\n"
      + data.map(e => `"${e.mes_ano}","${e.valor}","${e.created_at}","${e.observacoes.replace(/"/g, '""')}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `maissaude_vilhena_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="mais-saude-panel" className="space-y-6">
      
      {/* Visual Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white shadow-lg dark:from-slate-800 dark:via-emerald-950/40 dark:to-slate-800 border dark:border-slate-800">
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-100">
              Aprimoramento do SUS
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Programa Mais Saúde Vilhena</h2>
            <p className="mt-1 text-sm text-emerald-550 max-w-xl">
              Fomento municipal extraordinário focado na contratação das equipes médicas de Atenção Primária, modernização das UBS e digitalização do atendimento.
            </p>
          </div>
          <button
            id="toggle-add-ms-form"
            onClick={() => setFormOpen(!formOpen)}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Cadastrar Lançamento
          </button>
        </div>
        <div id="green-decoration-circle" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl"></div>
      </div>

      {/* Cadastro Form Integrado de Outro Programa */}
      {editOpen && (
        <form
          id="edit-mais-saude-form"
          onSubmit={handleEditSubmit}
          className="rounded-2xl border border-blue-100 bg-white p-6 shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between border-b pb-4 mb-4 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-500" />
              Editar Investimento Mais Saúde
            </h3>
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Campo Mês/Ano */}
            <div className="space-y-1.5Packed">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-500" /> Competência Mês / Ano
              </label>
              <div className="flex gap-2">
                <select
                  id="edit-mais-saude-month"
                  value={editMonth}
                  onChange={(e) => setEditMonth(e.target.value)}
                  className="w-1/2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <select
                  id="edit-mais-saude-year"
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  className="w-1/2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campo Valor */}
            <div className="space-y-1.5">
              <label htmlFor="edit-mais-saude-valor" className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-blue-500" /> Valor Repassado (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                <input
                  id="edit-mais-saude-valor"
                  type="text"
                  placeholder="0,00"
                  value={editValor}
                  onChange={e => {
                    const raw = e.target.value.replace(/\D/g, '');
                    if (!raw) { setEditValor(''); return; }
                    const num = parseInt(raw) / 100;
                    setEditValor(num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 font-semibold"
                  required
                />
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-1.5 md:col-span-1">
              <label htmlFor="edit-mais-saude-obs" className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-blue-500" /> Observações / Aditivos
              </label>
              <input
                id="edit-mais-saude-obs"
                type="text"
                placeholder="Ex. Parcela regular ou aditivo extraordinário..."
                value={editObs}
                onChange={e => setEditObs(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {submitError && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-3.5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              Cancelar
            </button>
            <button id="submit-edit-mais-saude" type="submit" disabled={isLoading} className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-blue-700 active:scale-95 disabled:opacity-50">
              {isLoading ? 'Atualizando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      )}

      {formOpen && (
        <form 
          id="add-ms-form"
          onSubmit={handleFormSubmit}
          className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between border-b pb-4 mb-4 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-500" />
              Novo Lançamento Mais Saúde
            </h3>
            <button 
              type="button" 
              onClick={() => setFormOpen(false)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {/* Campo Mês/Ano */}
            <div className="space-y-1.5Packed">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-emerald-500" /> Mês / Ano Referência
              </label>
              <div className="flex gap-2">
                <select
                  id="select-ms-month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-1/2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <select
                  id="select-ms-year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-1/2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campo Valor */}
            <div className="space-y-1.5">
              <label htmlFor="input-ms-valor" className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-emerald-500" /> Valor do Investimento (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                <input
                  id="input-ms-valor"
                  type="text"
                  placeholder="0,00"
                  value={valorInput}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '');
                    if (!raw) {
                      setValorInput('');
                      return;
                    }
                    const num = parseInt(raw) / 100;
                    setValorInput(num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 font-semibold"
                  required
                />
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-1.5">
              <label htmlFor="input-ms-obs" className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-emerald-500" /> Descrição do Destino / Aplicação
              </label>
              <input
                id="input-ms-obs"
                type="text"
                placeholder="Ex. Contratação de técnicos adicionais ou aquisição..."
                value={obsInput}
                onChange={(e) => setObsInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {submitError && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="mt-4 flex justify-end gap-3.5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Fechar
            </button>
            <button
              id="submit-ms"
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-emerald-700 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Salvando...' : 'Salvar Registro'}
            </button>
          </div>
        </form>
      )}

      {/* Sucesso Banner */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">
          <Activity className="h-4 w-4 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid de Estatísticas Secundárias */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Despendido</p>
          <p className="mt-1 text-lg font-extrabold text-slate-800 dark:text-slate-100">{formatCurrency(stats.total)}</p>
          <div className="mt-2.5 flex items-center gap-1.5 text-[9px] text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            <span>Fomento acumulado</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Aporte Médio</p>
          <p className="mt-1 text-lg font-extrabold text-slate-800 dark:text-slate-100">{formatCurrency(stats.media)}</p>
          <div className="mt-2.5 flex items-center gap-1.5 text-[9px] text-teal-600 dark:text-teal-400">
            <Layers className="h-3 w-3" />
            <span>Média por aporte mensal</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pico de Investimento</p>
          <p className="mt-1 text-lg font-extrabold text-slate-800 dark:text-slate-100">{formatCurrency(stats.max)}</p>
          <div className="mt-2.5 flex items-center gap-1.5 text-[9px] text-emerald-605 dark:text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            <span>Máxima alocada</span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Aportes Efetuados</p>
          <p className="mt-1 text-lg font-extrabold text-slate-800 dark:text-slate-100">{stats.count} registros</p>
          <div className="mt-2.5 flex items-center gap-1.5 text-[9px] text-slate-500">
            <Calendar className="h-3 w-3" />
            <span>Registros no programa</span>
          </div>
        </div>
      </div>

      {/* Gráfico Analítico */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Gráfico de Investimento do Mais Saúde</h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">Visão sequencial e comparativa do custeio básico</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChartType('area')}
              className={`rounded-lg px-3.5 py-1.5 text-[11px] font-bold transition ${
                chartType === 'area'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              Área Sombreada
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`rounded-lg px-3.5 py-1.5 text-[11px] font-bold transition ${
                chartType === 'bar'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              Barras Comparativas
            </button>
          </div>
        </div>

        {formattedChartData.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-slate-400 dark:text-slate-600">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p className="text-xs font-semibold">Sem dados suficientes para gerar o gráfico</p>
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={formattedChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#64748B' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(v) => `R$ ${v/1000}k`}
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(val) => [formatCurrency(Number(val)), 'Fomento Co-Financiado']}
                    labelStyle={{ color: '#0F172A', fontWeight: 'bold', fontSize: 11 }}
                    contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E2E8F0', fontSize: 11 }}
                  />
                  <Area type="monotone" dataKey="Mais Saúde (R$)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorMs)" />
                </AreaChart>
              ) : (
                <BarChart data={formattedChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#64748B' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(v) => `R$ ${v/1000}k`}
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    formatter={(val) => [formatCurrency(Number(val)), 'Fomento Co-Financiado']}
                    labelStyle={{ color: '#0F172A', fontWeight: 'bold', fontSize: 11 }}
                    contentStyle={{ borderRadius: '0.75rem', border: '1px solid #E2E8F0', fontSize: 11 }}
                  />
                  <Bar dataKey="Mais Saúde (R$)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tabela de Lançamentos */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        
        {/* Controle Superior de Filtros */}
        <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="search-ms"
              type="text"
              placeholder="Buscar por mês, valor ou aplicação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>
          <button
            id="export-ms-csv"
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <FileDown className="h-4 w-4 text-slate-550" />
            Exportar CSV
          </button>
        </div>

        {/* Listagem */}
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left text-xs text-slate-650 dark:text-slate-300">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-405 dark:bg-slate-950/40 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Mês / Ano Ref</th>
                <th className="px-5 py-3.5">Valor do Investimento</th>
                <th className="px-5 py-3.5">Criado em</th>
                <th className="px-5 py-3.5">Detalhamento da Aplicação</th>
                <th className="px-5 py-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTableData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center font-medium text-slate-400 dark:text-slate-600">
                    Nenhum investimento Mais Saúde cadastrado com esses critérios.
                  </td>
                </tr>
              ) : (
                filteredTableData.map((item) => {
                  const [year, month] = item.mes_ano.split('-');
                  const monthName = months.find(m => m.value === month)?.label || month;
                  return (
                    <tr id={`ms-row-${item.id}`} key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-100 font-sans">
                        {monthName} de {year}
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 dark:text-slate-200">
                        <span className="inline-flex items-center font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(item.valor)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[10px] text-slate-400 font-mono">
                        {new Date(item.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 max-w-sm truncate dark:text-slate-400" title={item.observacoes}>
                        {item.observacoes}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          id={`edit-ms-${item.id}`}
                          onClick={() => {
                            setEditId(item.id);
                            const [year, month] = item.mes_ano.split('-');
                            setEditYear(year);
                            setEditMonth(month);
                            setEditValor(item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
                            setEditObs(item.observacoes);
                            setEditOpen(true);
                          }}
                          className="mr-2 rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-950/20 dark:hover:text-blue-400 transition"
                          title="Editar Lançamento"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          id={`delete-ms-${item.id}`}
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja remover este investimento do Mais Saúde permanentemente?')) {
                              onDelete(item.id);
                            }
                          }}
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition"
                          title="Excluir Lançamento"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
