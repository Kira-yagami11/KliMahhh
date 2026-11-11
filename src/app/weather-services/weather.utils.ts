import type { DailyForecast, WeatherResponse } from './weather.models';

export interface WeatherCondition {
  label: string;
  icon: string;
}

const CONDITIONS: Record<number, WeatherCondition> = {
  0: { label: 'Clear sky', icon: 'sunny-outline' },
  1: { label: 'Mainly clear', icon: 'partly-sunny-outline' },
  2: { label: 'Partly cloudy', icon: 'partly-sunny-outline' },
  3: { label: 'Overcast', icon: 'cloud-outline' },
  45: { label: 'Fog', icon: 'cloud-outline' },
  48: { label: 'Depositing rime fog', icon: 'cloud-outline' },
  51: { label: 'Light drizzle', icon: 'rainy-outline' },
  53: { label: 'Moderate drizzle', icon: 'rainy-outline' },
  55: { label: 'Dense drizzle', icon: 'rainy-outline' },
  56: { label: 'Light freezing drizzle', icon: 'rainy-outline' },
  57: { label: 'Dense freezing drizzle', icon: 'rainy-outline' },
  61: { label: 'Slight rain', icon: 'rainy-outline' },
  63: { label: 'Moderate rain', icon: 'rainy-outline' },
  65: { label: 'Heavy rain', icon: 'rainy-outline' },
  66: { label: 'Light freezing rain', icon: 'rainy-outline' },
  67: { label: 'Heavy freezing rain', icon: 'rainy-outline' },
  71: { label: 'Slight snowfall', icon: 'snow-outline' },
  73: { label: 'Moderate snowfall', icon: 'snow-outline' },
  75: { label: 'Heavy snowfall', icon: 'snow-outline' },
  77: { label: 'Snow grains', icon: 'snow-outline' },
  80: { label: 'Slight rain showers', icon: 'rainy-outline' },
  81: { label: 'Moderate rain showers', icon: 'rainy-outline' },
  82: { label: 'Violent rain showers', icon: 'rainy-outline' },
  85: { label: 'Slight snow showers', icon: 'snow-outline' },
  86: { label: 'Heavy snow showers', icon: 'snow-outline' },
  95: { label: 'Thunderstorm', icon: 'thunderstorm-outline' },
  96: { label: 'Thunderstorm with slight hail', icon: 'thunderstorm-outline' },
  97: { label: 'Heavy thunderstorm', icon: 'thunderstorm-outline' },
  99: { label: 'Thunderstorm with heavy hail', icon: 'thunderstorm-outline' },
};

export function condition(code: number | null | undefined): WeatherCondition {
  return (code == null ? undefined : CONDITIONS[code]) ?? { label: 'Unknown condition', icon: 'help-circle-outline' };
}

export function measurement(value: number | null | undefined, unit: string | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'Unavailable';
  if (!unit) return `${value} (unit unavailable)`;
  return `${value}${unit === '%' || unit === '°C' || unit === '°F' ? '' : ' '}${unit}`;
}

export function dailyForecasts(data: WeatherResponse): DailyForecast[] {
  const daily = data.daily;
  return (daily?.time ?? []).slice(0, 7).map((date, index) => ({
    date,
    code: daily?.weather_code?.[index] ?? null,
    minimum: daily?.temperature_2m_min?.[index] ?? null,
    maximum: daily?.temperature_2m_max?.[index] ?? null,
    rainProbability: daily?.precipitation_probability_max?.[index] ?? null,
  }));
}

export function dayLabel(date: string): string {
  // Daily dates are calendar labels, never converted through the device timezone.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Date unavailable';
  const parsed = new Date(`${date}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-PH', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    parsed,
  );
}

export function modelTime(time: string | undefined): string {
  // The API returns local ISO timestamps without an offset for Asia/Manila.
  if (!time || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(time)) return 'Unavailable';
  const parsed = new Date(`${time}+08:00`);
  if (!Number.isFinite(parsed.getTime())) return 'Unavailable';
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Manila',
  }).format(parsed);
}

export function retrievalTime(time: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Manila',
  }).format(new Date(time));
}
