import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, 
  Plus, 
  Tag, 
  Folder, 
  Link as LinkIcon, 
  FileText, 
  Trash2, 
  Star, 
  X, 
  Download, 
  ChevronLeft,
  Filter,
  ArrowUpRight,
  UploadCloud,
  Clock,
  Type
} from 'lucide-react';

// --- TYPES & MOCK DATA ---
// (В JS типы описываются через JSDoc или подразумеваются структурой)
/**
 * @typedef {Object} Material
 * @property {string} id
 * @property {string} title
 * @property {string} [url]
 * @property {string} [fileData] - Base64 or Blob URL simulation
 * @property {string} [fileName]
 * @property {string[]} categories
 * @property {string[]} tags
 * @property {boolean} isFavorite
 * @property {string} created_at
 */

const PREDEFINED_CATEGORIES = ['Работа', 'Учеба', 'Личное', 'Дизайн', 'Разработка', 'Статьи'];

// --- STORE LOGIC (Zustand-like) ---
const useStore = () => {
  const [materials, setMaterials] = useState(() => {
    const saved = localStorage.getItem('knowledge_storage_data');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('knowledge_storage_data', JSON.stringify(materials));
  }, [materials]);

  const addMaterial = (material) => {
    setMaterials(prev => [material, ...prev]);
  };

  const deleteMaterial = (id) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const toggleFavorite = (id) => {
    setMaterials(prev => prev.map(m => 
      m.id === id ? { ...m, isFavorite: !m.isFavorite } : m
    ));
  };

  return { materials, addMaterial, deleteMaterial, toggleFavorite };
};

// --- COMPONENTS ---

const Badge = ({ children, className = "", onClick }) => (
  <span 
    onClick={onClick}
    className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${className}`}
  >
    {children}
  </span>
);

const MaterialCard = ({ material, onDelete, onToggleFavorite, onView }) => {
  return (
    <div className="group bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-indigo-500/50 transition-all flex flex-col h-full shadow-lg">
      <div className="flex justify-between items-start mb-3">
        <div className="p-2 bg-slate-800 rounded-lg text-indigo-400">
          {material.url ? <LinkIcon size={18} /> : <FileText size={18} />}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onToggleFavorite(material.id)}
            className={`p-1.5 rounded-md hover:bg-slate-800 ${material.isFavorite ? 'text-yellow-500' : 'text-slate-400'}`}
          >
            <Star size={16} fill={material.isFavorite ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={() => onDelete(material.id)}
            className="p-1.5 rounded-md hover:bg-red-500/20 text-slate-400 hover:text-red-500"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <h3 
        onClick={() => onView(material)}
        className="text-slate-100 font-semibold mb-2 cursor-pointer hover:text-indigo-400 transition-colors line-clamp-2"
      >
        {material.title}
      </h3>

      <div className="mt-auto">
        <div className="flex flex-wrap gap-1 mb-3">
          {material.categories.map(cat => (
            <Badge key={cat} className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {cat}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {new Date(material.created_at).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            {material.tags.length} тегов
          </span>
        </div>
      </div>
    </div>
  );
};

// --- MAIN PAGES ---

const LibraryPage = ({ materials, onDelete, onToggleFavorite, onNavigate, onView }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Все');
  const [sortBy, setSortBy] = useState('newest');

  const filteredMaterials = useMemo(() => {
    return materials
      .filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                             m.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
        const matchesCat = activeCategory === 'Все' || m.categories.includes(activeCategory);
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [materials, search, activeCategory, sortBy]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Моя Библиотека</h1>
          <p className="text-slate-400 text-sm">Всего сохранено: {materials.length}</p>
        </div>
        <button 
          onClick={() => onNavigate('add')}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20"
        >
          <Plus size={20} />
          Добавить материал
        </button>
      </header>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Поиск по названию или тегам..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="md:col-span-4 flex gap-2">
          <div className="flex-1 relative">
             <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
             <select 
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-slate-200 appearance-none focus:outline-none"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
             >
               <option value="newest">Сначала новые</option>
               <option value="title">По названию (А-Я)</option>
             </select>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {['Все', ...PREDEFINED_CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
              activeCategory === cat 
                ? 'bg-indigo-600 text-white' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMaterials.map(m => (
            <MaterialCard 
              key={m.id} 
              material={m} 
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onView={onView}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
          <Search size={48} className="mb-4 opacity-20" />
          <p>Ничего не найдено</p>
        </div>
      )}
    </div>
  );
};

const AddMaterialPage = ({ onAdd, onBack }) => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    file: null,
    categories: [],
    tags: [],
    currentTag: ''
  });
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return;

    const newMaterial = {
      id: crypto.randomUUID(),
      title: formData.title,
      url: formData.url || null,
      fileData: formData.file ? URL.createObjectURL(formData.file) : null,
      fileName: formData.file ? formData.file.name : null,
      categories: formData.categories,
      tags: formData.tags,
      isFavorite: false,
      created_at: new Date().toISOString()
    };

    onAdd(newMaterial);
    onBack();
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && formData.currentTag.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(formData.currentTag.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, formData.currentTag.trim()],
          currentTag: ''
        }));
      } else {
        setFormData(prev => ({ ...prev, currentTag: '' }));
      }
    }
  };

  const toggleCategory = (cat) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const handleFile = (file) => {
    if (file) {
      setFormData(prev => ({ ...prev, file, title: prev.title || file.name }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
      >
        <ChevronLeft size={20} />
        Назад в библиотеку
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Plus className="text-indigo-500" /> Новый материал
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload / URL area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
               <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
                 <LinkIcon size={14} /> URL ссылки
               </label>
               <input 
                 type="url"
                 placeholder="https://..."
                 className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-200 focus:border-indigo-500 outline-none transition-colors"
                 value={formData.url}
                 onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
               />
             </div>
             <div className="space-y-2">
               <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
                 <Type size={14} /> Название *
               </label>
               <input 
                 required
                 type="text"
                 placeholder="Название материала"
                 className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-slate-200 focus:border-indigo-500 outline-none transition-colors"
                 value={formData.title}
                 onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
               />
             </div>
          </div>

          <div 
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
            className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all ${
              isDragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <input 
              type="file" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <UploadCloud size={32} className={formData.file ? 'text-green-500' : 'text-slate-600'} />
            <p className="mt-2 text-sm text-slate-400">
              {formData.file ? `Выбран файл: ${formData.file.name}` : 'Перетащите файл или кликните для загрузки'}
            </p>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
              <Folder size={14} /> Категории
            </label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all border ${
                    formData.categories.includes(cat)
                      ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400'
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2">
              <Tag size={14} /> Теги (Enter для добавления)
            </label>
            <div className="flex flex-wrap gap-2 p-2 bg-slate-950 border border-slate-800 rounded-lg min-h-10.5">
              {formData.tags.map(tag => (
                <Badge key={tag} className="bg-slate-800 text-slate-300 flex items-center gap-1 group">
                  {tag}
                  <X 
                    size={12} 
                    className="cursor-pointer hover:text-white" 
                    onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))}
                  />
                </Badge>
              ))}
              <input 
                type="text"
                placeholder={formData.tags.length === 0 ? "Напр: полезное, дизайн..." : ""}
                className="bg-transparent outline-none text-sm text-slate-200 flex-1 min-w-30"
                value={formData.currentTag}
                onChange={e => setFormData(prev => ({ ...prev, currentTag: e.target.value }))}
                onKeyDown={handleTagKeyDown}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
          >
            Сохранить материал
          </button>
        </form>
      </div>
    </div>
  );
};

const MaterialDetailModal = ({ material, onClose, onToggleFavorite, onDelete }) => {
  if (!material) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
              {material.url ? <LinkIcon size={24} /> : <FileText size={24} />}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onToggleFavorite(material.id)}
                className={`p-2 rounded-lg bg-slate-800 ${material.isFavorite ? 'text-yellow-500' : 'text-slate-400'}`}
              >
                <Star size={20} fill={material.isFavorite ? "currentColor" : "none"} />
              </button>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{material.title}</h2>
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <span className="flex items-center gap-1"><Clock size={14} /> {new Date(material.created_at).toLocaleDateString()}</span>
              {material.categories.map(cat => (
                 <span key={cat} className="text-indigo-400 font-medium">#{cat}</span>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {material.url && (
              <a 
                href={material.url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between w-full p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-indigo-500/50 transition-colors group"
              >
                <div className="flex items-center gap-3 truncate">
                  <LinkIcon size={18} className="text-slate-500" />
                  <span className="text-indigo-400 truncate">{material.url}</span>
                </div>
                <ArrowUpRight size={18} className="text-slate-600 group-hover:text-indigo-400" />
              </a>
            )}

            {material.fileData && (
              <div className="flex items-center justify-between w-full p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-slate-500" />
                  <span className="text-slate-300 font-medium">{material.fileName}</span>
                </div>
                <a 
                  href={material.fileData} 
                  download={material.fileName}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-lg text-sm transition-colors"
                >
                  <Download size={16} /> Скачать
                </a>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Теги</h4>
            <div className="flex flex-wrap gap-2">
              {material.tags.length > 0 ? material.tags.map(tag => (
                <Badge key={tag} className="bg-slate-800 text-slate-300 py-1 px-3 text-sm">
                  {tag}
                </Badge>
              )) : <span className="text-slate-600 text-sm italic">Нет тегов</span>}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-950/50 flex justify-end">
          <button 
            onClick={() => { onDelete(material.id); onClose(); }}
            className="flex items-center gap-2 text-red-500/70 hover:text-red-500 text-sm font-medium transition-colors"
          >
            <Trash2 size={16} /> Удалить этот материал
          </button>
        </div>
      </div>
    </div>
  );
};

// --- APP ROOT ---

export default function App() {
  const { materials, addMaterial, deleteMaterial, toggleFavorite } = useStore();
  const [currentPage, setCurrentPage] = useState('library'); // library | add
  const [viewingMaterial, setViewingMaterial] = useState(null);

  // Keyboard accessibility
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setViewingMaterial(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Decorative BG elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('library')}>
            <span className="font-bold text-lg tracking-tight hidden sm:block">KCORE<span className=" ml-auto text-indigo-500">by Isaiev</span></span>
          </div>

          <div className="flex items-center gap-4">
             {/* Navigation could go here */}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentPage === 'library' && (
          <LibraryPage 
            materials={materials} 
            onDelete={deleteMaterial}
            onToggleFavorite={toggleFavorite}
            onNavigate={setCurrentPage}
            onView={setViewingMaterial}
          />
        )}

        {currentPage === 'add' && (
          <AddMaterialPage 
            onAdd={addMaterial}
            onBack={() => setCurrentPage('library')}
          />
        )}
      </main>

      {/* Modal for detail view */}
      {viewingMaterial && (
        <MaterialDetailModal 
          material={viewingMaterial}
          onClose={() => setViewingMaterial(null)}
          onToggleFavorite={toggleFavorite}
          onDelete={deleteMaterial}
        />
      )}

      <footer className="mt-20 py-8 border-t border-slate-900 text-center text-slate-600 text-xs">
        &copy; {new Date().getFullYear()} Knowledge Storage App — Построено для быстрого доступа.
      </footer>
    </div>
  );
}