import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { catchError, map, of, startWith, switchMap, timeout } from 'rxjs';

import type { WeatherLocation } from '../config/locations';

import type { WeatherRequest, WeatherResponse, WeatherSnapshot, WeatherState } from './weather.models';
import { dailyForecasts, hourlyForecasts } from './weather.utils';

export const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private readonly http = inject(HttpClient);

  getWeather(location: WeatherLocation): Observable<WeatherSnapshot> {
    const params = new HttpParams()
      .set('latitude', location.latitude)
      .set('longitude', location.longitude)
      .set(
        'current',
        'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index',
      )
      .set('hourly', 'temperature_2m,apparent_temperature,weather_code,precipitation_probability,uv_index')
      .set(
        'daily',
        'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max',
      )
      .set('timezone', 'Asia/Manila')
      .set('temperature_unit', 'celsius')
      .set('wind_speed_unit', 'kmh')
      .set('forecast_days', 7)
      .set('forecast_hours', 24);

    return this.http.get<WeatherResponse>(WEATHER_API, { params }).pipe(
      timeout(20_000),
      map((data): WeatherSnapshot => {
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid weather response');
        return {
          location,
          data,
          days: dailyForecasts(data),
          hours: hourlyForecasts(data),
          fetchedAt: new Date().toISOString(),
        };
      }),
    );
  }

  watch(requests: Observable<WeatherRequest>): Observable<WeatherState> {
    return requests.pipe(
      switchMap(({ location }) =>
        this.getWeather(location).pipe(
          map((snapshot): WeatherState => ({ loading: false, error: null, snapshot })),
          catchError((error: unknown) =>
            of<WeatherState>({ loading: false, snapshot: null, error: this.errorMessage(error) }),
          ),
          startWith<WeatherState>({ loading: true, error: null, snapshot: null }),
        ),
      ),
    );
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 429)
      return 'The weather service is busy. Please wait a moment and try again.';
    return 'Weather could not be loaded. Check your internet connection and try again.';
  }
}
