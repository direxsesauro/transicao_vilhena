import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  FileText,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle,
  Layers,
  Clock,
  Database,
  ArrowUpToLine,
  HelpCircle,
  Eye,
  X
} from 'lucide-react';
import { DownloadItem, DocumentType } from '../types';

interface DownloadsSectionProps {
  data: DownloadItem[];
  onUpload: (fileName: string, fileType: DocumentType, fileSize: number, base64OrBlobUrl: string, file: File, descricao: string) => Promise<void>;
  onUpdate: (id: string, fileName: string | null, fileType: DocumentType, fileSize: number | null, base64OrBlobUrl: string | null, file: File | null, descricao: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading: boolean;
  isSupabaseActive: boolean;
}

export default function DownloadsSection({
  data,
  onUpload,
  onUpdate,
  onDelete,
  isLoading,
  isSupabaseActive
}: DownloadsSectionProps) {
  const [selectedType, setSelectedType] = useState<DocumentType>('oficio');
  const [searchTerm, setSearchTerm] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // Estados para Confirmação de Upload
  interface UploadDraft {
    file: File;
    base64: string;
    tipo: DocumentType;
    descricao: string;
  }
  const [filesToUpload, setFilesToUpload] = useState<UploadDraft[]>([]);

  // Estados para Preview do PDF
  const [previewDoc, setPreviewDoc] = useState<DownloadItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Estados para Edição
  const [docToEdit, setDocToEdit] = useState<DownloadItem | null>(null);
  const [editDescricao, setEditDescricao] = useState('');
  const [editType, setEditType] = useState<DocumentType>('oficio');
  const [editFile, setEditFile] = useState<{ file: File, base64: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Formatar bytes em unidades comuns (KB, MB, GB)
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Badge visual para o tipo de documento
  const getDocTypeBadge = (tipo: DocumentType) => {
    switch (tipo) {
      case 'oficio':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
            Ofício
          </span>
        );
      case 'ordem_bancaria':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            Ordem Bancária
          </span>
        );
      case 'parecer_juridico':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            Parecer Jurídico
          </span>
        );
      case 'plano_de_trabalho':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2.5 py-1 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
            Plano de Trabalho
          </span>
        );
      case 'portaria':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-pink-50 px-2.5 py-1 text-[10px] font-semibold text-pink-700 dark:bg-pink-950/40 dark:text-pink-300">
            Portaria
          </span>
        );
      case 'termo_cooperacao':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
            Termo de Cooperação e Aditivos
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Outros
          </span>
        );
    }
  };

  // Filtro
  const filteredDocs = data.filter(doc => {
    const nameLower = doc.nome.toLowerCase();
    const typeLower = doc.tipo.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return nameLower.includes(searchLower) || typeLower.includes(searchLower);
  });

  // Gatilhos de Drag & Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Tratar múltiplos arquivos submetidos
  const processUploadedFiles = async (files: FileList | File[] | null) => {
    setUploadError('');
    setUploadSuccess('');

    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        setUploadError('Apenas arquivos no formato PDF (.pdf) são permitidos.');
        return;
      }
      if (file.size > 5 * 1024 * 1024 && !isSupabaseActive) {
        setUploadError('Tamanho máximo permitido no modo banco local é de 5MB por arquivo.');
        return;
      }
      validFiles.push(file);
    }

    const drafts: UploadDraft[] = [];

    for (const file of validFiles) {
      try {
        const base64Result = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result.split(',')[1] || '');
            } else {
              resolve('');
            }
          };
          reader.onerror = () => reject(new Error('Não foi possível ler o arquivo PDF.'));
          reader.readAsDataURL(file);
        });

        drafts.push({
          file,
          base64: base64Result,
          tipo: selectedType,
          descricao: ''
        });
      } catch (err: any) {
        setUploadError(err.message || 'Erro ao processar documento.');
        return;
      }
    }

    setFilesToUpload(prev => [...prev, ...drafts]);
  };

  const confirmUpload = async () => {
    if (filesToUpload.length === 0) return;
    try {
      for (const draft of filesToUpload) {
        await onUpload(
          draft.file.name,
          draft.tipo,
          draft.file.size,
          draft.base64,
          draft.file,
          draft.descricao
        );
      }
      setUploadSuccess(`${filesToUpload.length} documento(s) carregado(s) com sucesso!`);
      setTimeout(() => setUploadSuccess(''), 5000);
      setFilesToUpload([]);
    } catch (err: any) {
      setUploadError(err.message || 'Erro durante a persistência dos documentos.');
    }
  };

  const openEditModal = (doc: DownloadItem) => {
    setDocToEdit(doc);
    setEditDescricao(doc.descricao || '');
    setEditType(doc.tipo);
    setEditFile(null);
  };

  const confirmEdit = async () => {
    if (!docToEdit) return;
    try {
      await onUpdate(
        docToEdit.id,
        editFile ? editFile.file.name : null,
        editType,
        editFile ? editFile.file.size : null,
        editFile ? editFile.base64 : null,
        editFile ? editFile.file : null,
        editDescricao
      );
      setUploadSuccess(`"${docToEdit.nome}" atualizado com sucesso!`);
      setTimeout(() => setUploadSuccess(''), 5000);
      setDocToEdit(null);
      setEditFile(null);
    } catch (err: any) {
      // <-- LOG DE ERRO ADICIONADO
      console.error('Erro ao atualizar documento:', err);
      setUploadError(err.message || 'Erro ao atualizar o documento.');
    }
  };


  const handleEditFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value && e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        alert('Apenas arquivos no formato PDF (.pdf) são permitidos.');
        return;
      }
      if (file.size > 5 * 1024 * 1024 && !isSupabaseActive) {
        alert('Tamanho máximo permitido no modo banco local é de 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = async () => {
        let base64Result = '';
        if (typeof reader.result === 'string') {
          base64Result = reader.result.split(',')[1] || '';
        }
        setEditFile({ file, base64: base64Result });
      };
      reader.onerror = () => alert('Não foi possível ler o arquivo PDF.');
      reader.readAsDataURL(file);
    }
  };

  const triggerEditFileSelect = () => {
    editFileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFiles(e.target.files);
      e.target.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Tratar o download focado em conformidade
  const handleDownload = (doc: DownloadItem) => {
    if (!doc) return;

    try {
      // Se possui URL real (upload do Supabase Storage) e não indica fallback
      if (doc.url && doc.url !== '#') {
        const link = document.createElement("a");
        link.href = doc.url;
        link.target = "_blank";
        link.download = doc.nome;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Fallback para download local via stream base64
      const base64Data = doc.content_base64 || '';
      if (!base64Data) {
        alert("Conteúdo deste documento expirou ou está inacessível.");
        return;
      }

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = doc.nome;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpa após pequena latência
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

    } catch (err) {
      console.error('Falha de download:', err);
      alert('Erro ao tentar baixar o documento PDF.');
    }
  };

  // Tratar a visualização do documento no modal
  const handlePreview = (doc: DownloadItem) => {
    if (!doc) return;

    try {
      if (doc.url && doc.url !== '#') {
        setPreviewUrl(doc.url);
        setPreviewDoc(doc);
        return;
      }

      const base64Data = doc.content_base64 || '';
      if (!base64Data) {
        alert("Conteúdo deste documento expirou ou está inacessível.");
        return;
      }

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      setPreviewUrl(blobUrl);
      setPreviewDoc(doc);
    } catch (err) {
      console.error('Falha ao visualizar:', err);
      alert('Erro ao tentar visualizar o documento PDF.');
    }
  };

  const closePreview = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewDoc(null);
  };

  return (
    <div id="downloads-panel" className="space-y-6">

      {/* Visual Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 p-6 text-white shadow-lg dark:from-slate-800 dark:via-teal-950/40 dark:to-slate-800 border dark:border-slate-800">
        <div id="teal-decor" className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/25 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-100">
              Controle Social & LAI
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">Downloads e Documentações Técnicas</h2>
            <p className="mt-1 text-sm text-teal-50 max-w-xl">
              Faça upload ou download direto de aditivos contratuais, demonstrações contábeis e prestações de contas da saúde municipal de Vilhena.
            </p>
          </div>
          <div className="flex select-none gap-2 self-start rounded-xl bg-black/15 p-1.5 backdrop-blur-md">
            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/10 rounded-lg">Arquivos Oficiais PDF</span>
          </div>
        </div>
        <div id="teal-decoration-circle" className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-2xl"></div>
      </div>

      {/* Upload Zone & Form */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upload Component */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Carregar Novo Documento PDF</h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">Insira arquivos oficiais de controle e transparência.</p>
            </div>

            {/* Categoria Selector */}
            <div className="space-y-1.5">
              <label htmlFor="select-doc-type" className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-teal-500" /> Categoria do Arquivo
              </label>
              <select
                id="select-doc-type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as DocumentType)}
                className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-250 outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="oficio">Ofício</option>
                <option value="ordem_bancaria">Ordem Bancária</option>
                <option value="outros">Outros</option>
                <option value="parecer_juridico">Parecer Jurídico</option>
                <option value="plano_de_trabalho">Plano de Trabalho</option>
                <option value="portaria">Portaria</option>
                <option value="termo_cooperacao">Termo de Cooperação e Aditivos</option>
              </select>
            </div>

            {/* Drag Area */}
            <div
              id="file-drag-container"
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`group relative flex h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${dragActive
                ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20'
                : 'border-slate-200 bg-slate-100 bg-opacity-30 hover:border-teal-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:bg-slate-900'
                }`}
            >
              <input
                id="file-upload-input"
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isLoading}
              />

              <div className="flex flex-col items-center justify-center p-4 text-center select-none">
                <div className={`mb-3.5 rounded-full p-2.5 transition ${dragActive ? 'bg-teal-100 text-teal-600 dark:bg-teal-950' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                  }`}>
                  <Upload className="h-5 w-5 group-hover:scale-110 transition" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-350">
                  {isLoading ? 'Realizando Upload...' : 'Arraste o PDF ou clique aqui'}
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  Apenas formato .PDF (Max. {isSupabaseActive ? '50MB' : '5MB'})
                </p>
              </div>
            </div>

            {/* Error notifications */}
            {uploadError && (
              <div className="flex items-center gap-1.5 rounded-lg bg-red-50 p-2.5 text-[10px] font-bold text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Success notifications */}
            {uploadSuccess && (
              <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 p-2.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/50">
                <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 mt-4 dark:border-slate-805 flex items-center gap-2 text-[9px] text-slate-400">
            <Database className="h-3.5 w-3.5 text-slate-500" />
            <span>
              {isSupabaseActive
                // ? 'Armazenamento: Supabase Cloud Bucket (Transparência Oficial)'
                // : 'Armazenamento: Cache de Sessão do Navegador Local'
              }
            </span>
          </div>
        </div>

        {/* Documents Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Documentos Cadastrados</h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">Pesquise, visualize e faça o download dos itens públicos.</p>
            </div>

            {/* Campo pesquisa */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                id="search-docs"
                type="text"
                placeholder="Pesquisar arquivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-48 pl-9 pr-3.5 py-1.5 text-[11px] rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-350 outline-none focus:border-teal-500 focus:bg-white"
              />
            </div>
          </div>

          {/* List containers */}
          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-650 dark:text-slate-350">
              <thead className="bg-slate-50 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-950/40 dark:text-slate-450">
                <tr>
                  <th className="px-4 py-3">Arquivo / Nome</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3 hidden md:table-cell">Observações</th>
                  <th className="px-4 py-3">Data Carregamento</th>
                  <th className="px-4 py-3">Tamanho</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-11 text-center font-semibold text-slate-400 dark:text-slate-600">
                      Nenhum documento cadastrado sob esses moldes de busca.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => {
                    return (
                      <tr id={`doc-row-${doc.id}`} key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-all">
                        <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                          <div className="flex items-center gap-2.5">
                            <FileText className="h-4.5 w-4.5 text-teal-600 shrink-0" />
                            <span className="truncate max-w-[160px] sm:max-w-[200px] text-xs font-semibold" title={doc.nome}>
                              {doc.nome}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getDocTypeBadge(doc.tipo)}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-[10px] text-slate-500 dark:text-slate-400">
                          {doc.descricao ? (
                            <span className="line-clamp-2 max-w-[180px]" title={doc.descricao}>
                              {doc.descricao}
                            </span>
                          ) : (
                            <span className="italic text-slate-300 dark:text-slate-600">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[10px] text-slate-400 font-mono">
                          {new Date(doc.data_upload).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3 text-[10px] text-slate-400 font-mono">
                          {formatBytes(doc.tamanho)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1 sm:gap-2">
                            {/* Visualizar */}
                            <button
                              id={`preview-doc-${doc.id}`}
                              onClick={() => handlePreview(doc)}
                              className="rounded-lg p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:hover:bg-blue-900/40 transition active:scale-95"
                              title="Visualizar PDF"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            {/* Baixar */}
                            <button
                              id={`download-doc-${doc.id}`}
                              onClick={() => handleDownload(doc)}
                              className="rounded-lg p-1.5 text-teal-600 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/20 dark:text-teal-400 dark:hover:bg-teal-900/40 transition active:scale-95"
                              title="Download PDF"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                            {/* Editar */}
                            <button
                              id={`edit-doc-${doc.id}`}
                              onClick={() => openEditModal(doc)}
                              className="rounded-lg p-1.5 text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:hover:bg-amber-900/40 transition active:scale-95"
                              title="Editar Documento"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                            {/* Deletar */}
                            <button
                              id={`delete-doc-${doc.id}`}
                              onClick={() => {
                                if (window.confirm(`Deseja realmente remover o documento "${doc.nome}"?`)) {
                                  onDelete(doc.id);
                                }
                              }}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-955/20 dark:hover:text-red-400 transition"
                              title="Remover Documento"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
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

      {/* Modal de Pré-visualização do PDF */}
      {previewDoc && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6">
          <div className="flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-teal-50 dark:bg-teal-950/30 p-2 text-teal-600 dark:text-teal-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-white truncate max-w-md md:max-w-xl">{previewDoc.nome}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Visualização de Documento Oficial</p>
                </div>
              </div>
              <button
                onClick={closePreview}
                className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition active:scale-95"
                title="Fechar Visualização"
              >
                <X className="h-4 w-4" />
                Fechar
              </button>
            </div>

            {/* Corpo do Modal - PDF Viewer */}
            <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-2 sm:p-4">
              <iframe
                src={previewUrl}
                className="h-full w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                title="Preview PDF"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Upload */}
      {filesToUpload.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6">
          <div className="flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-4">
              <h3 className="font-bold text-slate-800 dark:text-white">Confirmar Upload de Documentos</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Classifique a categoria e adicione observações para cada arquivo.</p>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto bg-slate-100/50 dark:bg-slate-950/50">
              {filesToUpload.map((draft, index) => (
                <div key={index} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-teal-500" />
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 break-all">{draft.file.name}</p>
                        <p className="text-xs font-mono text-slate-400">{formatBytes(draft.file.size)}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setFilesToUpload(prev => prev.filter((_, i) => i !== index))}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 p-1.5 rounded-lg transition"
                      title="Remover arquivo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoria</label>
                      <select 
                        value={draft.tipo}
                        onChange={e => {
                          const newFiles = [...filesToUpload];
                          newFiles[index].tipo = e.target.value as DocumentType;
                          setFilesToUpload(newFiles);
                        }}
                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs dark:bg-slate-900 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-teal-500 focus:bg-white transition"
                      >
                        <option value="oficio">Ofício</option>
                        <option value="ordem_bancaria">Ordem Bancária</option>
                        <option value="outros">Outros</option>
                        <option value="parecer_juridico">Parecer Jurídico</option>
                        <option value="plano_de_trabalho">Plano de Trabalho</option>
                        <option value="portaria">Portaria</option>
                        <option value="termo_cooperacao">Termo de Cooperação e Aditivos</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Observações</label>
                      <input 
                        type="text"
                        value={draft.descricao}
                        onChange={e => {
                          const newFiles = [...filesToUpload];
                          newFiles[index].descricao = e.target.value;
                          setFilesToUpload(newFiles);
                        }}
                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs dark:bg-slate-900 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-teal-500 focus:bg-white transition"
                        placeholder="Opcional..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 bg-white dark:bg-slate-900 p-5 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setFilesToUpload([])}
                className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 border-transparent py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmUpload}
                disabled={isLoading}
                className="flex-1 rounded-xl bg-teal-600 py-2.5 text-sm font-bold text-white hover:bg-teal-700 transition disabled:opacity-50"
              >
                {isLoading ? 'Enviando...' : `Confirmar ${filesToUpload.length} arquivo(s)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Documento */}
      {docToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6">
          <div className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-4">
              <h3 className="font-bold text-slate-800 dark:text-white">Editar Documento</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Altere informações ou o arquivo PDF</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Categoria do Arquivo</label>
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as DocumentType)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-250 outline-none focus:border-teal-500 focus:bg-white"
                >
                  <option value="oficio">Ofício</option>
                  <option value="ordem_bancaria">Ordem Bancária</option>
                  <option value="outros">Outros</option>
                  <option value="parecer_juridico">Parecer Jurídico</option>
                  <option value="plano_de_trabalho">Plano de Trabalho</option>
                  <option value="portaria">Portaria</option>
                  <option value="termo_cooperacao">Termo de Cooperação e Aditivos</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Descrição / Observações</label>
                <textarea
                  value={editDescricao}
                  onChange={(e) => setEditDescricao(e.target.value)}
                  placeholder="Ex: Termo aditivo..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 min-h-[80px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Substituir Arquivo (Opcional)</label>
                <div
                  onClick={triggerEditFileSelect}
                  className="cursor-pointer rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 text-center hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleEditFileInputChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                  {editFile ? (
                    <div className="text-xs text-teal-600 dark:text-teal-400 font-bold break-all">
                      {editFile.file.name} ({formatBytes(editFile.file.size)}) selecionado
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Clique para selecionar um novo PDF se desejar substituir o arquivo atual.
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3 bg-slate-50 dark:bg-slate-950 p-5 mt-auto">
              <button
                onClick={() => {
                  setDocToEdit(null);
                  setEditFile(null);
                }}
                className="flex-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmEdit}
                disabled={isLoading}
                className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-white hover:bg-amber-600 transition disabled:opacity-50"
              >
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
