import React, { useEffect, useState } from 'react';
import { CheckCircle2, Circle, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { getTasks, toggleTask, addTask, getTransactions } from '../services/storage';
import { fetchWeatherData } from '../services/weather';
import { Task, TransactionType, WeatherData } from '../types';
import WeatherWidget from '../components/WeatherWidget';

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [balance, setBalance] = useState({ income: 0, expense: 0, total: 0 });
  
  // Weather State
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);

  useEffect(() => {
    loadData();
    loadWeather();
  }, []);

  const loadData = () => {
    setTasks(getTasks());
    
    // Calculate simple balance
    const txs = getTransactions();
    let income = 0;
    let expense = 0;
    txs.forEach(t => {
      if (t.type === TransactionType.INCOME) income += t.amount;
      else expense += t.amount;
    });
    setBalance({ income, expense, total: income - expense });
  };

  const loadWeather = () => {
    setWeatherLoading(true);
    setWeatherError(false);

    if (!navigator.geolocation) {
      setWeatherError(true);
      setWeatherLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await fetchWeatherData(position.coords.latitude, position.coords.longitude);
          setWeatherData(data);
          setWeatherLoading(false);
        } catch (e) {
          console.error(e);
          setWeatherError(true);
          setWeatherLoading(false);
        }
      },
      (error) => {
        console.error("Geo error:", error);
        // Fallback to a central location (e.g., Brasília) if permission denied or error
        // This ensures the UI still looks good for demo purposes
        fetchWeatherData(-15.7975, -47.8919)
          .then(data => {
             setWeatherData(data);
             setWeatherLoading(false);
          })
          .catch(() => {
             setWeatherError(true);
             setWeatherLoading(false);
          });
      }
    );
  };

  const handleToggleTask = (id: string) => {
    const updated = toggleTask(id);
    setTasks(updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const updated = addTask(newTaskTitle);
    setTasks(updated);
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-6">
      
      {/* Weather Module */}
      <section>
        <WeatherWidget 
          data={weatherData} 
          loading={weatherLoading} 
          error={weatherError} 
          onRetry={loadWeather} 
        />
      </section>

      {/* Financial Summary Card */}
      <section className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-4">Resumo do Mês</h2>
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-green-50 p-3 rounded-xl border border-green-100">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <ArrowUpRight size={16} />
                <span className="text-xs font-bold">RECEITAS</span>
              </div>
              <p className="text-xl font-bold text-gray-800">
                R$ {balance.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
           </div>
           <div className="bg-red-50 p-3 rounded-xl border border-red-100">
              <div className="flex items-center gap-2 text-red-700 mb-1">
                <ArrowDownRight size={16} />
                <span className="text-xs font-bold">DESPESAS</span>
              </div>
              <p className="text-xl font-bold text-gray-800">
                R$ {balance.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
           </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm text-gray-500">Saldo Atual</span>
            <span className={`text-lg font-bold ${balance.total >= 0 ? 'text-agro-700' : 'text-red-600'}`}>
              R$ {balance.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
        </div>
      </section>

      {/* Tasks Section */}
      <section className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Tarefas de Hoje</h2>
          <span className="bg-agro-100 text-agro-800 text-xs font-bold px-2 py-1 rounded-full">
            {tasks.filter(t => !t.isDone).length} pendentes
          </span>
        </div>

        {/* Add Task Input */}
        <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Nova tarefa..."
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-agro-600"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <button 
            type="submit"
            disabled={!newTaskTitle}
            className="bg-agro-700 text-white p-2 rounded-lg disabled:opacity-50"
          >
            <Plus size={20} />
          </button>
        </form>

        <div className="space-y-3">
          {tasks.length === 0 && (
            <p className="text-gray-400 text-center py-4 text-sm">Nenhuma tarefa registrada.</p>
          )}
          {tasks.map(task => (
            <div 
              key={task.id} 
              onClick={() => handleToggleTask(task.id)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {task.isDone ? (
                <CheckCircle2 className="text-agro-600 flex-shrink-0" size={24} />
              ) : (
                <Circle className="text-gray-300 flex-shrink-0" size={24} />
              )}
              <span className={`text-sm ${task.isDone ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                {task.title}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;