import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PlusCircle, MinusCircle, Wallet, TrendingUp } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { getTransactions, addTransaction } from '../services/storage';

const Finance: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<TransactionType>(TransactionType.EXPENSE);
  
  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    const newTx = addTransaction({
      description,
      amount: parseFloat(amount),
      type: formType,
      category: category || 'Geral',
      date: new Date().toISOString()
    });

    setTransactions([newTx, ...transactions]);
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('');
  };

  const openForm = (type: TransactionType) => {
    setFormType(type);
    setShowForm(true);
  };

  // Chart Data Preparation
  const chartData = [
    { name: 'Receita', value: transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, curr) => acc + curr.amount, 0) },
    { name: 'Despesa', value: transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, curr) => acc + curr.amount, 0) },
  ];

  return (
    <div className="space-y-6">
      
      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => openForm(TransactionType.INCOME)}
          className="flex flex-col items-center justify-center p-4 bg-green-600 text-white rounded-xl shadow-sm hover:bg-green-700 active:scale-95 transition-all"
        >
          <PlusCircle size={28} className="mb-2" />
          <span className="font-bold text-sm">Nova Venda</span>
        </button>
        <button 
          onClick={() => openForm(TransactionType.EXPENSE)}
          className="flex flex-col items-center justify-center p-4 bg-red-500 text-white rounded-xl shadow-sm hover:bg-red-600 active:scale-95 transition-all"
        >
          <MinusCircle size={28} className="mb-2" />
          <span className="font-bold text-sm">Nova Despesa</span>
        </button>
      </div>

      {/* Chart Section */}
      <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-agro-700" size={20} />
          <h2 className="font-bold text-gray-800">Balanço Financeiro</h2>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis hide />
              <Tooltip 
                 cursor={{ fill: 'transparent' }}
                 contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#16a34a' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Recent Transactions List */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
           <h3 className="font-bold text-gray-800">Histórico Recente</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Nenhuma transação registrada</div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                 <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${t.type === TransactionType.INCOME ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                       {t.type === TransactionType.INCOME ? <PlusCircle size={18} /> : <MinusCircle size={18} />}
                    </div>
                    <div>
                       <p className="text-sm font-semibold text-gray-900">{t.description}</p>
                       <p className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString('pt-BR')} • {t.category}</p>
                    </div>
                 </div>
                 <span className={`font-bold text-sm ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'} R$ {t.amount.toFixed(2)}
                 </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
              <div className={`p-4 ${formType === TransactionType.INCOME ? 'bg-green-600' : 'bg-red-500'} text-white flex justify-between items-center`}>
                 <h3 className="font-bold text-lg">{formType === TransactionType.INCOME ? 'Nova Receita' : 'Nova Despesa'}</h3>
                 <button onClick={() => setShowForm(false)} className="text-white/80 hover:text-white">✕</button>
              </div>
              <form onSubmit={handleSave} className="p-5 space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Descrição</label>
                    <input 
                      type="text" 
                      required
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder={formType === TransactionType.INCOME ? "Ex: Venda de milho" : "Ex: Compra de adubo"}
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Valor (R$)</label>
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
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Categoria</label>
                    <input 
                      type="text" 
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      placeholder="Opcional"
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
                    />
                 </div>
                 <div className="pt-2">
                    <button type="submit" className={`w-full py-3 rounded-xl font-bold text-white shadow-md ${formType === TransactionType.INCOME ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'} transition-colors`}>
                       Confirmar
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Finance;