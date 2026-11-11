import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { LOCATIONS } from '../config/locations';

import type { WeatherRequest, WeatherState } from './weather.models';
import { WeatherService, WEATHER_API } from './weather.service';

describe('WeatherService', () => {
  let service: WeatherService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(WeatherService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('uses a typed GET for every weather request', () => {
    service.getWeather(LOCATIONS[0]).subscribe();
    const first = http.expectOne((req) => req.url === WEATHER_API);
    expect(first.request.method).toBe('GET');
    expect(first.request.params.get('timezone')).toBe('Asia/Manila');
    expect(first.request.params.get('forecast_days')).toBe('7');
    first.flush({ current: { temperature_2m: 0 } });
    service.getWeather(LOCATIONS[0]).subscribe((snapshot) => expect(snapshot.location.id).toBe(LOCATIONS[0].id));
    http.expectOne((req) => req.url === WEATHER_API).flush({});
  });
  it('cancels stale requests and recovers after an error', () => {
    const requests = new Subject<WeatherRequest>();
    const states: WeatherState[] = [];
    const subscription = service.watch(requests).subscribe((state) => states.push(state));
    requests.next({ location: LOCATIONS[0] });
    const stale = http.expectOne((req) => req.url === WEATHER_API);
    requests.next({ location: LOCATIONS[1] });
    expect(stale.cancelled).toBe(true);
    http.expectOne((req) => req.url === WEATHER_API).flush('busy', { status: 429, statusText: 'Too Many Requests' });
    expect(states.at(-1)?.loading).toBe(false);
    expect(states.at(-1)?.error).toContain('busy');
    requests.next({ location: LOCATIONS[1] });
    http.expectOne((req) => req.url === WEATHER_API).flush({});
    expect(states.at(-1)?.snapshot?.location.id).toBe('san-jose');
    subscription.unsubscribe();
  });
});
