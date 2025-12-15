import { WeatherData } from '../types';

// WMO Weather interpretation codes (http://www.wmo.int/pages/prog/www/IMOP/WMO306/WMO306_vI-1/CodeTables/Hyb-Code_4678.pdf)
export const getWeatherDescription = (code: number): string => {
  switch (code) {
    case 0: return 'Céu Limpo';
    case 1: return 'Principalmente Limpo';
    case 2: return 'Parcialmente Nublado';
    case 3: return 'Nublado';
    case 45: case 48: return 'Nevoeiro';
    case 51: case 53: case 55: return 'Garoa';
    case 61: case 63: case 65: return 'Chuva';
    case 80: case 81: case 82: return 'Pancadas de Chuva';
    case 95: case 96: case 99: return 'Tempestade';
    default: return 'Variável';
  }
};

export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
    );

    if (!response.ok) {
      throw new Error('Falha ao buscar dados do clima');
    }

    const data = await response.json();

    const current = {
      temp: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
      weatherCode: data.current.weather_code,
      isDay: data.current.is_day === 1
    };

    // Map next 3 days
    const daily = data.daily.time.slice(0, 3).map((time: string, index: number) => ({
      date: time,
      maxTemp: data.daily.temperature_2m_max[index],
      minTemp: data.daily.temperature_2m_min[index],
      rainProb: data.daily.precipitation_probability_max[index],
      weatherCode: data.daily.weather_code[index]
    }));

    return { current, daily };
  } catch (error) {
    console.error("Weather Service Error:", error);
    throw error;
  }
};