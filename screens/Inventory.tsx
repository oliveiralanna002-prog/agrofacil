import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, AlertTriangle, Search, MinusCircle, PlusCircle } from 'lucide-react';
import { InventoryItem } from '../types';
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from '../services/storage';

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('un');
  const [minThreshold, setMinThreshold] = useState('');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = () => {
    setItems(getInventory());
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity) return;

    addInventoryItem({
      name,
      quantity: parseFloat(quantity),
      unit,
      minThreshold: parseFloat(minThreshold) || 0
    });

    loadInventory();
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setQuantity('');
    setUnit('un');
    setMinThreshold('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este item?')) {
      deleteInventoryItem(id);
      loadInventory();
    }
  };

  const adjustStock = (item: InventoryItem, amount: number) => {
    const newQuantity = Math.max(0, item.quantity + amount);
    updateInventoryItem({ ...item, quantity: newQuantity });
    loadInventory();
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = items.filter(i => i.quantity <= i.minThreshold).length;

  const units = ['un', 'kg', 'sc', 'l', 'ton', 'cx', 'm'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-agro-700" />
          Estoque
        </h2>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-agro-600 text-white p-2 rounded-lg hover:bg-agro-700 transition-colors shadow-sm"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-2 text-agro-700 mb-2">
             <Package size={18} />
             <span className="text-xs font-bold uppercase">Total de Itens</span>
           </div>
           <p className="text-2xl font-bold text-gray-800">
             {items.length}
           </p>
        </div>
        <div className={`p-4 rounded-xl shadow-sm border ${lowStockCount > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}>
           <div className={`flex items-center gap-2 mb-2 ${lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
             <AlertTriangle size={18} />
             <span className="text-xs font-bold uppercase">Estoque Baixo</span>
           </div>
           <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-red-700' : 'text-gray-800'}`}>
             {lowStockCount} <span className="text-sm font-normal text-gray-500">alertas</span>
           </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <input 
          type="text" 
          placeholder="Buscar item..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
        />
        <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
      </div>

      {/* Items List */}
      <div className="space-y-3 pb-20">
        {filteredItems.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <Package size={48} className="mx-auto mb-2 opacity-20" />
            <p>Nenhum item encontrado.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isLowStock = item.quantity <= item.minThreshold;
            
            return (
              <div key={item.id} className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between ${isLowStock ? 'ring-1 ring-red-200 bg-red-50/30' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    {isLowStock && (
                      <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        BAIXO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Mínimo: {item.minThreshold} {item.unit}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center min-w-[60px]">
                    <span className={`text-lg font-bold ${isLowStock ? 'text-red-600' : 'text-agro-700'}`}>
                      {item.quantity}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{item.unit}</span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <button 
                      onClick={() => adjustStock(item, 1)}
                      className="p-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
                    >
                      <PlusCircle size={20} />
                    </button>
                    <button 
                      onClick={() => adjustStock(item, -1)}
                      className="p-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                    >
                      <MinusCircle size={20} />
                    </button>
                  </div>

                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="ml-2 text-gray-300 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Item Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
              <div className="p-4 bg-agro-700 text-white flex justify-between items-center">
                 <h3 className="font-bold text-lg">Novo Item</h3>
                 <button onClick={() => setShowForm(false)} className="text-white/80 hover:text-white">✕</button>
              </div>
              <form onSubmit={handleSave} className="p-5 space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nome do Item</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ex: Ração Gado"
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Quantidade</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        placeholder="0.00"
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Unidade</label>
                      <select 
                        value={unit}
                        onChange={e => setUnit(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-agro-500"
                      >
                         {units.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                   </div>
                 </div>

                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Alerta de Estoque Mínimo</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={minThreshold}
                      onChange={e => setMinThreshold(e.target.value)}
                      placeholder="Ex: 10"
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Você será avisado quando o estoque estiver abaixo deste valor.</p>
                 </div>

                 <div className="pt-2">
                    <button type="submit" className="w-full py-3 rounded-xl font-bold text-white shadow-md bg-agro-600 hover:bg-agro-700 transition-colors">
                       Salvar Item
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;