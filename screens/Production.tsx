import React, { useState, useEffect } from 'react';
import { Sprout, Wheat, Leaf, Plus } from 'lucide-react';
import { ProductionRecord } from '../types';
import { getProduction, addProduction } from '../services/storage';

const Production: React.FC = () => {
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('kg');
  const [type, setType] = useState<'CROP' | 'ANIMAL'>('CROP');

  useEffect(() => {
    setRecords(getProduction());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    const newRecord = addProduction({
      name,
      amount: parseFloat(amount),
      unit,
      type,
      date: new Date().toISOString()
    });

    setRecords([newRecord, ...records]);
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setAmount('');
    setUnit('kg');
    setType('CROP');
  };

  const units = ['kg', 'sc', 'ton', 'l', 'un'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Sprout className="text-agro-700" />
          Produção
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
           <div className="flex items-center gap-2 text-green-600 mb-2">
             <Wheat size={18} />
             <span className="text-xs font-bold uppercase">Agricultura</span>
           </div>
           <p className="text-2xl font-bold text-gray-800">
             {records.filter(r => r.type === 'CROP').length} <span className="text-sm text-gray-400 font-normal">registros</span>
           </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <div className="flex items-center gap-2 text-orange-600 mb-2">
             <Leaf size={18} />
             <span className="text-xs font-bold uppercase">Pecuária</span>
           </div>
           <p className="text-2xl font-bold text-gray-800">
             {records.filter(r => r.type === 'ANIMAL').length} <span className="text-sm text-gray-400 font-normal">registros</span>
           </p>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
           <h3 className="font-bold text-gray-700 text-sm">Histórico de Produção</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {records.length === 0 ? (
             <div className="p-8 text-center text-gray-400 text-sm">Nenhum registro de produção.</div>
          ) : (
            records.map((record) => (
              <div key={record.id} className="p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${record.type === 'CROP' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {record.type === 'CROP' ? <Wheat size={20} /> : <Leaf size={20} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{record.name}</h4>
                    <p className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-agro-700 text-lg">
                    {record.amount} <span className="text-xs text-gray-500 font-medium">{record.unit}</span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
              <div className="p-4 bg-agro-700 text-white flex justify-between items-center">
                 <h3 className="font-bold text-lg">Registrar Produção</h3>
                 <button onClick={() => setShowForm(false)} className="text-white/80 hover:text-white">✕</button>
              </div>
              <form onSubmit={handleSave} className="p-5 space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Cultura / Animal</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ex: Milho Safrinha"
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
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
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
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Tipo</label>
                    <div className="flex gap-2">
                       <button 
                         type="button"
                         onClick={() => setType('CROP')}
                         className={`flex-1 py-2 rounded-lg text-sm font-medium border ${type === 'CROP' ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-200 text-gray-600'}`}
                       >
                         Agricultura
                       </button>
                       <button 
                         type="button"
                         onClick={() => setType('ANIMAL')}
                         className={`flex-1 py-2 rounded-lg text-sm font-medium border ${type === 'ANIMAL' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'border-gray-200 text-gray-600'}`}
                       >
                         Pecuária
                       </button>
                    </div>
                 </div>

                 <div className="pt-2">
                    <button type="submit" className="w-full py-3 rounded-xl font-bold text-white shadow-md bg-agro-600 hover:bg-agro-700 transition-colors">
                       Salvar Registro
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Production;