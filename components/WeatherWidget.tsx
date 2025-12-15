import React from 'react';
import { 
  Cloud, Sun, CloudRain, CloudLightning, Wind, Droplets, 
  CloudFog, CalendarDays, MapPin 
} from 'lucide-react';
import { WeatherData } from '../types';
import { getWeatherDescription } from '../services/weather';

interface WeatherWidgetProps {
  data: WeatherData | null;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
}

const WeatherIcon: React.FC<{ code: number; className?: string }> = ({ code, className }) => {
  // Simple mapping based on WMO codes
  if (code === 0 || code === 1) return <Sun className={className} />;
  if (code === 2 || code === 3) return <Cloud className={className} />;
  if (code >= 45 && code <= 48) return <CloudFog className={className} />;
  if (code >= 51 && code <= 67) return <CloudRain className={className} />;
  if (code >= 80 && code <= 82) return <CloudRain className={className} />;
  if (code >= 95) return <CloudLightning className={className} />;
  return <Cloud className={className} />;
};

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ data, loading, error, onRetry }) => {
  if (loading) {
    return (
      <div className="bg-blue-500 rounded-2xl p-6 text-white h-48 flex items-center justify-center animate-pulse">
        <p>Carregando previsão...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 rounded-2xl p-6 border border-red-100 text-center">
        <CloudRain className="mx-auto text-red-300 mb-2" size={32} />
        <p className="text-red-600 font-medium text-sm mb-2">Não foi possível carregar o clima.</p>
        <button 
          onClick={onRetry}
          className="text-xs bg-white border border-red-200 text-red-600 px-3 py-1 rounded-full font-bold"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const { current, daily } = data;

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl text-white shadow-lg overflow-hidden">
      {/* Header / Current */}
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1 text-blue-100 text-sm mb-1">
              <MapPin size={14} />
              <span>Clima Local</span>
            </div>
            <h2 className="text-3xl font-bold">{Math.round(current.temp)}°C</h2>
            <p className="font-medium text-blue-100">{getWeatherDescription(current.weatherCode)}</p>
          </div>
          <WeatherIcon code={current.weatherCode} className="text-yellow-300 w-16 h-16" />
        </div>

        {/* Current Details */}
        <div className="flex gap-4 mt-4 text-sm text-blue-100 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Wind size={16} />
            <span>{current.windSpeed} km/h</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets size={16} />
            <span>{current.humidity}% Umid.</span>
          </div>
        </div>
      </div>

      {/* Daily Forecast */}
      <div className="bg-blue-700/30 p-4 backdrop-blur-md">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-blue-200 flex items-center gap-1">
            <CalendarDays size={12} /> Próximos Dias
          </span>
        </div>
        <div className="divide-y divide-blue-400/30">
          {daily.map((day) => (
            <div key={day.date} className="flex justify-between items-center py-2 first:pt-0 last:pb-0">
              <span className="text-sm w-20">
                {new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })}
              </span>
              <div className="flex items-center gap-2 flex-1 justify-center">
                <WeatherIcon code={day.weatherCode} className="w-4 h-4 text-blue-200" />
                <span className="text-xs text-blue-100">{day.rainProb}% chuva</span>
              </div>
              <div className="text-sm font-bold w-16 text-right">
                {Math.round(day.maxTemp)}° <span className="text-blue-300 font-normal">{Math.round(day.minTemp)}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;