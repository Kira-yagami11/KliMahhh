import type { DailyForecast, HourlyForecast, WeatherResponse } from './weather.models';

export interface WeatherCondition {
  label: string;
  icon: string;
}

export interface WeatherBackground {
  type: 'image' | 'video';
  src: string;
  alt: string;
  contrast: 'light' | 'dark';
}

export interface WeatherNotice {
  title: string;
  message: string;
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

export function weatherBackground(code: number | null | undefined, time?: string): WeatherBackground {
  const hour = time ? Number(time.slice(11, 13)) : NaN;
  if (Number.isInteger(hour) && (hour < 6 || hour >= 18)) {
    return { type: 'video', src: 'assets/backgrounds/night.mp4', alt: 'Night sky', contrast: 'dark' };
  }
  if (code === 0)
    return { type: 'image', src: 'assets/backgrounds/sunny.webp', alt: 'Sunny sky', contrast: 'light' };
  if (code === 1 || code === 2)
    return {
      type: 'image',
      src: 'assets/backgrounds/partly-cloudy.webp',
      alt: 'Partly cloudy sky',
      contrast: 'light',
    };
  if (code === 3)
    return { type: 'image', src: 'assets/backgrounds/cloudy.webp', alt: 'Cloudy sky', contrast: 'light' };
  if (code === 45 || code === 48)
    return { type: 'image', src: 'assets/backgrounds/fog.webp', alt: 'Foggy sky', contrast: 'light' };
  if (code != null && code >= 95)
    return {
      type: 'image',
      src: 'assets/backgrounds/thunderstorm.webp',
      alt: 'Thunderstorm sky',
      contrast: 'dark',
    };
  if (code != null && ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)))
    return { type: 'image', src: 'assets/backgrounds/rain.jpeg', alt: 'Rainy sky', contrast: 'dark' };
  return {
    type: 'video',
    src: 'assets/backgrounds/clouds.mp4',
    alt: 'Clouds moving across the sky',
    contrast: 'light',
  };
}

export function weatherContrast(code: number | null | undefined, time?: string): 'light' | 'dark' {
  return weatherBackground(code, time).contrast;
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

export function hourlyForecasts(data: WeatherResponse): HourlyForecast[] {
  const hourly = data.hourly;
  const times = hourly?.time ?? [];
  const start = data.current?.time ? Math.max(times.indexOf(data.current.time), 0) : 0;
  return times.slice(start, start + 12).map((time, index) => {
    const sourceIndex = start + index;
    return {
      time,
      temperature: hourly?.temperature_2m?.[sourceIndex] ?? null,
      apparentTemperature: hourly?.apparent_temperature?.[sourceIndex] ?? null,
      code: hourly?.weather_code?.[sourceIndex] ?? null,
      rainProbability: hourly?.precipitation_probability?.[sourceIndex] ?? null,
      uvIndex: hourly?.uv_index?.[sourceIndex] ?? null,
    };
  });
}

export function weatherNotice(data: WeatherResponse): WeatherNotice | null {
  const current = data.current;
  const code = current?.weather_code;
  if (code != null && code >= 95)
    return {
      title: 'Severe weather reminder',
      message: 'Thunderstorms are possible. Stay indoors and avoid open areas.',
      icon: 'warning-outline',
    };
  if (typeof current?.apparent_temperature === 'number' && current.apparent_temperature >= 38)
    return {
      title: 'Heat safety reminder',
      message: `Feels like ${Math.round(current.apparent_temperature)}°C. Stay hydrated and limit direct sun.`,
      icon: 'water-outline',
    };
  if (typeof current?.uv_index === 'number' && current.uv_index >= 8)
    return {
      title: 'High UV reminder',
      message: 'UV levels are high. Use sun protection and limit prolonged exposure.',
      icon: 'sunny-outline',
    };
  const rainProbability = data.daily?.precipitation_probability_max?.[0];
  if (
    typeof rainProbability === 'number' &&
    rainProbability >= 70 &&
    code != null &&
    ((code >= 51 && code <= 67) || (code >= 80 && code <= 82))
  )
    return {
      title: 'Rain reminder',
      message: 'Rain is likely today. Bring an umbrella when heading out.',
      icon: 'rainy-outline',
    };
  return null;
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

export function hourLabel(time: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(time)) return 'Unavailable';
  const parsed = new Date(`${time}+08:00`);
  if (!Number.isFinite(parsed.getTime())) return 'Unavailable';
  return new Intl.DateTimeFormat('en-PH', {
    hour: 'numeric',
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
