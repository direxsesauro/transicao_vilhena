import React, { useState, useEffect } from 'react';
import {
  getSupabaseClient
} from './supabase';
import { Repasse, MaisSaude, DownloadItem, DocumentType } from './types';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import RepassesSection from './components/RepassesSection';
import MaisSaudeSection from './components/MaisSaudeSection';
import DownloadsSection from './components/DownloadsSection';
import {
  Menu,
  X,
  Coins,
  Activity,
  Download,
  Database,
  AlertCircle,
  HelpCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

export default function App() {
  // O Supabase agora é ativo por padrão usando as variáveis de ambiente
  const isSupabaseActive = true;

  // Estados principais de dados
  const [repasses, setRepasses] = useState<Repasse[]>([]);
  const [maisSaude, setMaisSaude] = useState<MaisSaude[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);

  // Estados de navegação e UI
  const [activeSection, setActiveSection] = useState<string>('repasses');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [syncWarning, setSyncWarning] = useState<string>('');

  // Sincronizar o tema visual com localStorage & classes
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleThemeToggle = () => {
    if (isDarkMode) {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  // Carregar dados no bootstrap
  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      setSyncWarning('');

      const supabase = getSupabaseClient();

      if (supabase) {
        try {
          const { data: repData, error: repError } = await supabase.from('repasses').select('*');
          if (repError) throw repError;

          const { data: msData, error: msError } = await supabase.from('mais_saude').select('*');
          if (msError) throw msError;

          const { data: dlData, error: dlError } = await supabase.from('downloads').select('*');
          if (dlError) throw dlError;

          setRepasses(repData || []);
          setMaisSaude(msData || []);
          setDownloads(dlData || []);

        } catch (err: any) {
          console.error('Falha ao sincronizar com Supabase.', err);
          setSyncWarning('Erro ao conectar com o banco de dados. Verifique suas configurações e tabelas.');
        }
      }
      setIsLoading(false);
    };

    loadAllData();
  }, []);

  // CRUD --- REPASSES
  const handleAddRepasse = async (mes_ano: string, valor: number, observacoes: string, data_documento: string) => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { error } = await supabase
          .from('repasses')
          .insert([{ mes_ano, valor, observacoes, data_documento }]);

        if (error) throw error;

        // Recarrega dados atualizados da nuvem
        const { data } = await supabase.from('repasses').select('*');
        setRepasses(data || []);
      } catch (err: any) {
        setIsLoading(false);
        throw new Error(err.message || 'Erro de rede no banco Supabase.');
      }
    }
    setIsLoading(false);
  };

  const handleUpdateRepasse = async (id: string, mes_ano: string, valor: number, observacoes: string, data_documento: string) => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data: updatedRows, error } = await supabase
          .from('repasses')
          .update({ mes_ano, valor, observacoes, data_documento })
          .eq('id', id)
          .select();

        if (error) throw error;

        if (!updatedRows || updatedRows.length === 0) {
          throw new Error('Nenhum registro foi atualizado. Verifique as políticas RLS (WITH CHECK) no Supabase.');
        }

        const { data } = await supabase.from('repasses').select('*');
        setRepasses(data || []);
      } catch (err: any) {
        console.error('Erro ao atualizar repasse:', err);
        setIsLoading(false);
        throw new Error(err.message || 'Erro ao atualizar repasse.');
      }
    }
    setIsLoading(false);
  };

  const handleDeleteRepasse = async (id: string) => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { error } = await supabase
          .from('repasses')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setRepasses(repasses.filter(r => r.id !== id));
      } catch (err: any) {
        console.error('Erro ao deletar:', err);
      }
    }
    setIsLoading(false);
  };

  // CRUD --- MAIS SAÚDE
  const handleAddMaisSaude = async (mes_ano: string, valor: number, observacoes: string, data_documento: string) => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { error } = await supabase
          .from('mais_saude')
          .insert([{ mes_ano, valor, observacoes, data_documento }]);

        if (error) throw error;

        const { data } = await supabase.from('mais_saude').select('*');
        setMaisSaude(data || []);
      } catch (err: any) {
        setIsLoading(false);
        throw new Error(err.message || 'Erro de rede no banco Supabase.');
      }
    }
    setIsLoading(false);
  };

  const handleUpdateMaisSaude = async (id: string, mes_ano: string, valor: number, observacoes: string, data_documento: string) => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { data: updatedRows, error } = await supabase
          .from('mais_saude')
          .update({ mes_ano, valor, observacoes, data_documento })
          .eq('id', id)
          .select();

        if (error) throw error;

        if (!updatedRows || updatedRows.length === 0) {
          throw new Error('Nenhum registro foi atualizado. Verifique as políticas RLS (WITH CHECK) no Supabase.');
        }

        const { data } = await supabase.from('mais_saude').select('*');
        setMaisSaude(data || []);
      } catch (err: any) {
        console.error('Erro ao atualizar Mais Saúde:', err);
        setIsLoading(false);
        throw new Error(err.message || 'Erro ao atualizar registro de Mais Saúde.');
      }
    }
    setIsLoading(false);
  };

  const handleDeleteMaisSaude = async (id: string) => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { error } = await supabase
          .from('mais_saude')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setMaisSaude(maisSaude.filter(m => m.id !== id));
      } catch (err: any) {
        console.error('Erro ao deletar:', err);
      }
    }
    setIsLoading(false);
  };

  // CRUD --- DOWNLOADS & STORAGE
  const handleUploadDownloadItem = async (
    fileName: string,
    fileType: DocumentType,
    fileSize: number,
    base64OrBlobUrl: string,
    file: File,
    descricao: string
  ) => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const sanitizedName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const uniqueFileName = `${Date.now()}_${sanitizedName}`;

        // 1. Upload do arquivo físico para o Bucket 'documentos' do Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documentos')
          .upload(uniqueFileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Detalhes do Erro de Upload:", uploadError);
          throw new Error(`Erro do Supabase (${uploadError.name || '400'}): ${uploadError.message}. Verifique as políticas RLS do Storage.`);
        }

        // 2. Obter URL público gerado
        const { data: { publicUrl } } = supabase.storage
          .from('documentos')
          .getPublicUrl(uniqueFileName);

        // 3. Cadastrar registro de metadados na tabela de downloads do Supabase
        const { error: dbError } = await supabase
          .from('downloads')
          .insert([{
            nome: fileName,
            tipo: fileType,
            tamanho: fileSize,
            url: publicUrl,
            is_local: false,
            descricao: descricao
          }]);

        if (dbError) throw dbError;

        // Recarrega downloads atualizados
        const { data } = await supabase.from('downloads').select('*');
        setDownloads(data || []);

      } catch (err: any) {
        setIsLoading(false);
        throw new Error(err.message || 'Erro durante a sincronização em nuvem do arquivo físico.');
      }
    }
    setIsLoading(false);
  };

  const handleUpdateDownloadItem = async (
    id: string,
    fileName: string | null,
    fileType: DocumentType,
    fileSize: number | null,
    base64OrBlobUrl: string | null,
    file: File | null,
    descricao: string
  ) => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        let publicUrl = undefined;
        let finalFileName = undefined;
        let finalFileSize = undefined;

        // Se um novo arquivo foi enviado, faz o upload
        if (file && fileName) {
          const sanitizedName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          const uniqueFileName = `${Date.now()}_${sanitizedName}`;

          const { error: uploadError } = await supabase.storage
            .from('documentos')
            .upload(uniqueFileName, file, { cacheControl: '3600', upsert: false });

          if (uploadError) throw new Error(`Erro do Supabase (${uploadError.name || '400'}): ${uploadError.message}.`);

          const { data: { publicUrl: newUrl } } = supabase.storage
            .from('documentos')
            .getPublicUrl(uniqueFileName);

          publicUrl = newUrl;
          finalFileName = fileName;
          finalFileSize = fileSize;
        }

        // Atualizar registro no banco
        const updatePayload: any = {
          tipo: fileType,
          descricao: descricao
        };

        if (publicUrl) updatePayload.url = publicUrl;
        if (finalFileName) updatePayload.nome = finalFileName;
        if (finalFileSize) updatePayload.tamanho = finalFileSize;

        const { error: dbError } = await supabase
          .from('downloads')
          .update(updatePayload)
          .eq('id', id);

        if (dbError) throw dbError;

        const { data } = await supabase.from('downloads').select('*');
        setDownloads(data || []);

      } catch (err: any) {
        setIsLoading(false);
        throw new Error(err.message || 'Erro ao atualizar o documento.');
      }
    }
    setIsLoading(false);
  };

  const handleDeleteDownloadItem = async (id: string) => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (supabase) {
      try {
        const { error } = await supabase
          .from('downloads')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setDownloads(downloads.filter(d => d.id !== id));
      } catch (err: any) {
        console.error('Erro de deleção:', err);
      }
    }
    setIsLoading(false);
  };

  // Agregações financeiras globais rápidas para o cabeçalho
  const sumRepasses = repasses.reduce((acc, curr) => acc + curr.valor, 0);
  const sumMaisSaude = maisSaude.reduce((acc, curr) => acc + curr.valor, 0);

  // Renderizador condicional baseado na aba ativa
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'repasses':
        return (
          <RepassesSection
            data={repasses}
            onAdd={handleAddRepasse}
            onUpdate={handleUpdateRepasse}
            onDelete={handleDeleteRepasse}
            isLoading={isLoading}
          />
        );
      case 'mais_saude':
        return (
          <MaisSaudeSection
            data={maisSaude}
            onAdd={handleAddMaisSaude}
            onUpdate={handleUpdateMaisSaude}
            onDelete={handleDeleteMaisSaude}
            isLoading={isLoading}
          />
        );
      case 'downloads':
        return (
          <DownloadsSection
            data={downloads}
            onUpload={handleUploadDownloadItem}
            onUpdate={handleUpdateDownloadItem}
            onDelete={handleDeleteDownloadItem}
            isLoading={isLoading}
            isSupabaseActive={isSupabaseActive && !syncWarning}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div id="application-container" className="flex min-h-screen bg-slate-50 text-slate-800 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">

      {/* Sidebar de navegação esquerda - Desktop */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isSupabaseActive={isSupabaseActive && !syncWarning}
      />

      {/* Área Direta de Exibição */}
      <div className="flex flex-1 flex-col overflow-x-hidden min-h-screen">

        {/* Cabecalho Principal */}
        <Header
          activeSection={activeSection}
          isDarkMode={isDarkMode}
          onThemeToggle={handleThemeToggle}
          totalRepasses={sumRepasses}
          totalMaisSaude={sumMaisSaude}
          totalFiles={downloads.length}
          isSupabaseActive={isSupabaseActive && !syncWarning}
        />

        {/* Caixa de Aviso de Sincronia caso haja chaves incorretas */}
        {syncWarning && (
          <div className="mx-6 mt-6 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-xs font-semibold text-amber-800 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50">
            <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Aviso de Configuração Pendente</p>
              <p className="font-normal mt-1 leading-normal">
                {syncWarning} Vá na aba <strong>Banco & Tabelas</strong> no menu lateral para copiar o código SQL e executá-lo no editor do Supabase gratuitamente.
              </p>
            </div>
          </div>
        )}

        {/* Conteúdo Principal Selecionado com Transição Adaptativa */}
        <main id="main-content" className="flex-1 p-6 md:p-8 animate-fade-in">
          {renderActiveSection()}
        </main>

        {/* Menu Flutuante / NavBar de Aço para telas Mobile */}
        <nav id="mobile-nav-bar" className="sticky bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200 bg-white/90 py-2.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
          <button
            id="mobile-nav-repasses"
            onClick={() => setActiveSection('repasses')}
            className={`flex flex-col items-center gap-1 text-[9px] font-bold ${activeSection === 'repasses' ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <Coins className="h-4.5 w-4.5" />
            <span>Repasses</span>
          </button>

          <button
            id="mobile-nav-ms"
            onClick={() => setActiveSection('mais_saude')}
            className={`flex flex-col items-center gap-1 text-[9px] font-bold ${activeSection === 'mais_saude' ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            <Activity className="h-4.5 w-4.5" />
            <span>Mais Saúde</span>
          </button>

          <button
            id="mobile-nav-downloads"
            onClick={() => setActiveSection('downloads')}
            className={`flex flex-col items-center gap-1 text-[9px] font-bold ${activeSection === 'downloads' ? 'text-teal-600' : 'text-slate-400'}`}
          >
            <Download className="h-4.5 w-4.5" />
            <span>Transparência</span>
          </button>


        </nav>
      </div>
    </div>
  );
}
