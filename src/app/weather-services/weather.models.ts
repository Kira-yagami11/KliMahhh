import type { WeatherLocation } from '../config/locations';

export interface CurrentWeather {
  time?: string;
  interval?: number;
  temperature_2m?: number | null;
  relative_humidity_2m?: number | null;
  apparent_temperature?: number | null;
  weather_code?: number | null;
  wind_speed_10m?: number | null;
}

export interface DailyWeather {
  time?: string[];
  weather_code?: (number | null)[];
  temperature_2m_max?: (number | null)[];
  temperature_2m_min?: (number | null)[];
  precipitation_probability_max?: (number | null)[];
}

export interface WeatherUnits {
  time?: string;
  interval?: string;
  temperature_2m?: string;
  relative_humidity_2m?: string;
  apparent_temperature?: string;
  weather_code?: string;
  wind_speed_10m?: string;
  temperature_2m_max?: string;
  temperature_2m_min?: string;
  precipitation_probability_max?: string;
}

export interface WeatherResponse {
  latitude?: number;
  longitude?: number;
  elevation?: number;
  timezone?: string;
  utc_offset_seconds?: number;
  current?: CurrentWeather | null;
  current_units?: WeatherUnits | null;
  daily?: DailyWeather | null;
  daily_units?: WeatherUnits | null;
}

export interface DailyForecast {
  date: string;
  code: number | null;
  minimum: number | null;
  maximum: number | null;
  rainProbability: number | null;
}

export interface WeatherSnapshot {
  location: WeatherLocation;
  data: WeatherResponse;
  days: DailyForecast[];
  fetchedAt: string;
}

export interface WeatherRequest {
  location: WeatherLocation;
}

export interface WeatherState {
  loading: boolean;
  error: string | null;
  snapshot: WeatherSnapshot | null;
}
