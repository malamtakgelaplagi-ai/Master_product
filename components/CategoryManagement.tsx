
import React, { useState } from 'react';
import { Category } from '../types';
import CategoryFormModal from './CategoryFormModal';

interface CategoryManagementProps {
  categories: Category[];
  isLoading: boolean;
  onSave: (categories: Category[]) => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ categories, isLoading, onSave }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleSave = (categoryData: Omit<Category, 'id'>) => {
    if (editingCategory) {
      const updated = categories.map(c => 
        c.id === editingCategory.id ? { ...categoryData, id: c.id } : c
      );
      onSave(updated);
    } else {
      const newCat: Category = { 
        id: Date.now().toString(), 
        ...categoryData 
      };
      onSave([...categories, newCat]);
    }
    setIsModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-500 font-medium">Memuat Data Kategori...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Master Data Kategori</h2>
          <p className="text-sm text-slate-500">Konfigurasi sub-kategori, ukuran, dan bahan untuk master produk.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-all"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Tambah Kategori
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Kategori</th>
                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Sub-Kategori</th>
                <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Opsi Atribut</th>
                <th className="px-6 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic">Belum ada kategori yang dikonfigurasi.</td>
                </tr>
              ) : (
                categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{cat.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(cat.subCategories) ? cat.subCategories.map((s, i) => (
                          <span key={i} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold border border-blue-100">{s}</span>
                        )) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase">Ukuran:</span>
                          <span className="text-[9px] font-bold text-slate-600">
                            {Array.isArray(cat.availableSizes) ? cat.availableSizes.join(', ') : (typeof cat.availableSizes === 'string' ? cat.availableSizes : '-')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase">Warna:</span>
                          <span className="text-[9px] font-bold text-slate-600">
                            {Array.isArray(cat.availableColors) ? cat.availableColors.join(', ') : (typeof cat.availableColors === 'string' ? cat.availableColors : '-')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase">Bahan:</span>
                          <span className="text-[9px] font-bold text-slate-600">
                            {Array.isArray(cat.availableMaterials) ? cat.availableMaterials.join(', ') : (typeof cat.availableMaterials === 'string' ? cat.availableMaterials : '-')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEdit(cat)}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Kategori"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <CategoryFormModal 
          isOpen={isModalOpen}
          initialData={editingCategory}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleSave}
          existingNames={categories.filter(c => c.id !== editingCategory?.id).map(c => c.name)}
        />
      )}
    </div>
  );
};

export default CategoryManagement;
