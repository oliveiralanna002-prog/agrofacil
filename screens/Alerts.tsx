import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Trash2, Plus, BellRing, Calculator, Sprout } from 'lucide-react';
import { Alert, AlertType } from '../types';
import { getAlerts, addAlert, deleteAlert, addProduction } from '../services/storage';

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);

  // Alert Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<AlertType>(AlertType.GENERAL);
  const [notifySystem, setNotifySystem] = useState(false);

  // Harvest Calculation State
  const [showCalculator, setShowCalculator] = useState(false);
  const [plantingDate, setPlantingDate] = useState('');
  const [cycleDays, setCycleDays] = useState('');

  // Production Record Modal State
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [harvestAmount, setHarvestAmount] = useState('');
  const [harvestUnit, setHarvestUnit] = useState('sc');

  useEffect(() => {
    setAlerts(getAlerts());
  }, []);

  // --- Calculator Logic ---
  useEffect(() => {
    if (showCalculator && plantingDate && cycleDays) {
      const pDate = new Date(plantingDate);
      const days = parseInt(cycleDays);
      if (!isNaN(days) && !isNaN(pDate.getTime())) {
        const hDate = new Date(pDate.getTime() + days * 24 * 60 * 60 * 1000);
        // Format for datetime-local input: YYYY-MM-DDTHH:MM
        const iso = hDate.toISOString().slice(0, 16);
        setDate(iso);
      }
    }
  }, [plantingDate, cycleDays, showCalculator]);

  const requestPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    const updatedList = addAlert({
      title,
      date: new Date(date).toISOString(),
      type,
      notifySystem
    });
    
    if (notifySystem && permission === 'granted') {
      new Notification("Alerta Criado", {
        body: `Alerta para ${title} agendado.`,
        icon: '/favicon.ico'
      });
    }

    setAlerts(updatedList);
    setShowForm(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este alerta?')) {
      const updatedList = deleteAlert(id);
      setAlerts(updatedList);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDate('');
    setType(AlertType.GENERAL);
    setNotifySystem(false);
    setShowCalculator(false);
    setPlantingDate('');
    setCycleDays('');
  };

  // --- Harvest Flow ---
  const handleOpenHarvest = (alert: Alert) => {
    setSelectedAlert(alert);
    setHarvestAmount('');
    setShowHarvestModal(true);
  };

  const handleSaveHarvest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlert || !harvestAmount) return;

    // Add Production Record
    addProduction({
      name: selectedAlert.title, // Use alert title as crop name
      amount: parseFloat(harvestAmount),
      unit: harvestUnit,
      type: 'CROP',
      date: new Date().toISOString()
    });

    // Optionally delete the alert or keep it
    if (window.confirm('Produção registrada! Deseja remover o alerta de colheita?')) {
      const updatedList = deleteAlert(selectedAlert.id);
      setAlerts(updatedList);
    }

    setShowHarvestModal(false);
    setSelectedAlert(null);
  };

  const getIconColor = (type: AlertType) => {
    switch (type) {
      case AlertType.FERTILIZATION: return 'text-green-600 bg-green-100';
      case AlertType.HARVEST: return 'text-orange-600 bg-orange-100';
      case AlertType.VACCINATION: return 'text-red-600 bg-red-100';
      case AlertType.WEATHER: return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Bell className="text-agro-700" />
          Alertas
        </h2>
        {permission === 'default' && (
          <button onClick={requestPermission} className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold">
            Ativar Notificações
          </button>
        )}
      </div>

      {/* Add Button */}
      {!showForm && (
        <button 
          onClick={() => setShowForm(true)}
          className="w-full py-3 bg-agro-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-agro-700 transition-colors"
        >
          <Plus size={20} />
          Criar Novo Alerta
        </button>
      )}

      {/* Create Alert Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 animate-fade-in">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título do Evento</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-agro-500 outline-none"
                placeholder="Ex: Colheita do Milho"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value as AlertType)}
                  className="w-full p-2 border border-gray-200 rounded-lg bg-white outline-none"
                >
                  {Object.values(AlertType).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              
              {type === AlertType.HARVEST && (
                 <div className="flex items-center pt-6">
                    <button 
                      type="button"
                      onClick={() => setShowCalculator(!showCalculator)}
                      className={`text-xs flex items-center gap-1 font-bold px-2 py-1.5 rounded-lg border transition-colors ${showCalculator ? 'bg-orange-100 text-orange-700 border-orange-300' : 'bg-gray-50 text-gray-600 border-gray-200'}`}
                    >
                      <Calculator size={14} />
                      {showCalculator ? 'Manual' : 'Calcular Data'}
                    </button>
                 </div>
              )}
            </div>

            {/* Harvest Calculator Section */}
            {showCalculator && type === AlertType.HARVEST && (
              <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 space-y-3">
                 <div className="flex items-center gap-2 text-orange-800 text-xs font-bold uppercase">
                    <Sprout size={14} />
                    <span>Calculadora de Ciclo</span>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                       <label className="block text-xs font-semibold text-orange-800 mb-1">Data Plantio</label>
                       <input 
                          type="date"
                          value={plantingDate}
                          onChange={(e) => setPlantingDate(e.target.value)} 
                          className="w-full p-2 text-sm border border-orange-200 rounded-lg focus:outline-none"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-semibold text-orange-800 mb-1">Ciclo (dias)</label>
                       <input 
                          type="number" 
                          value={cycleDays}
                          onChange={(e) => setCycleDays(e.target.value)}
                          placeholder="Ex: 120"
                          className="w-full p-2 text-sm border border-orange-200 rounded-lg focus:outline-none"
                       />
                    </div>
                 </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora</label>
              <input 
                type="datetime-local" 
                value={date}
                readOnly={showCalculator && type === AlertType.HARVEST}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-agro-500 outline-none ${showCalculator ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                required
              />
            </div>

            <div className="flex items-center">
                 <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notifySystem}
                      onChange={(e) => setNotifySystem(e.target.checked)}
                      className="w-4 h-4 text-agro-600 rounded focus:ring-agro-500"
                    />
                    Receber notificação no celular
                 </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 text-gray-600 bg-gray-100 rounded-lg font-medium">Cancelar</button>
              <button type="submit" className="flex-1 py-2 text-white bg-agro-600 rounded-lg font-bold shadow-sm">Salvar</button>
            </div>
          </div>
        </form>
      )}

      {/* Alerts List */}
      <div className="space-y-3">
        {alerts.length === 0 && !showForm && (
           <div className="text-center py-10 text-gray-400">
             <Bell size={48} className="mx-auto mb-2 opacity-20" />
             <p>Nenhum alerta agendado.</p>
           </div>
        )}

        {alerts.map((alert) => {
          const isPast = new Date(alert.date) < new Date();
          const colorClass = getIconColor(alert.type);
          
          return (
            <div key={alert.id} className={`p-4 bg-white rounded-xl shadow-sm border border-gray-100 ${isPast ? 'opacity-75' : ''}`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <BellRing size={20} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-800 truncate">{alert.title}</h3>
                    <button onClick={() => handleDelete(alert.id)} className="text-gray-400 hover:text-red-500 ml-2">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <p className="text-xs text-agro-600 font-semibold uppercase mt-0.5">{alert.type}</p>
                  
                  <div className="flex items-center gap-1 text-gray-500 text-sm mt-1 mb-2">
                    <Calendar size={14} />
                    <span>
                      {new Date(alert.date).toLocaleDateString('pt-BR')} às {new Date(alert.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>

                  {/* Harvest Action Button */}
                  {alert.type === AlertType.HARVEST && (
                    <button 
                      onClick={() => handleOpenHarvest(alert)}
                      className="w-full mt-2 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-orange-100 transition-colors"
                    >
                      <Sprout size={16} />
                      Registrar Produção
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Harvest Registration Modal */}
      {showHarvestModal && selectedAlert && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
              <div className="p-4 bg-orange-600 text-white flex justify-between items-center">
                 <h3 className="font-bold text-lg">Registrar Colheita</h3>
                 <button onClick={() => setShowHarvestModal(false)} className="text-white/80 hover:text-white">✕</button>
              </div>
              
              <div className="p-4 bg-orange-50 border-b border-orange-100">
                <p className="text-sm text-orange-800">
                  Registrando produção para: <span className="font-bold">{selectedAlert.title}</span>
                </p>
              </div>

              <form onSubmit={handleSaveHarvest} className="p-5 space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Quantidade</label>
                      <input 
                        type="number" 
                        step="0.01"
                        required
                        value={harvestAmount}
                        onChange={e => setHarvestAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-agro-500"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Unidade</label>
                      <select 
                        value={harvestUnit}
                        onChange={e => setHarvestUnit(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-agro-500"
                      >
                         {['sc', 'kg', 'ton', 'l', 'cx'].map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                   </div>
                 </div>

                 <div className="pt-2">
                    <button type="submit" className="w-full py-3 rounded-xl font-bold text-white shadow-md bg-orange-600 hover:bg-orange-700 transition-colors">
                       Confirmar e Salvar
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
};

export default Alerts;