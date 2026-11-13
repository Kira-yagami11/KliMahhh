import {
  condition,
  dailyForecasts,
  dayLabel,
  hourlyForecasts,
  measurement,
  modelTime,
  weatherBackground,
  weatherNotice,
} from './weather.utils';

describe('weather display rules', () => {
  it('preserves zero and labels missing measurements', () => {
    expect(measurement(0, '°C')).toBe('0°C');
    expect(measurement(0, '%')).toBe('0%');
    expect(measurement(null, '°C')).toBe('Unavailable');
    expect(measurement(undefined, 'km/h')).toBe('Unavailable');
    expect(measurement(NaN, '%')).toBe('Unavailable');
    expect(measurement(4, undefined)).toContain('unit unavailable');
  });
  it('maps WMO codes, including zero and the documented code 97', () => {
    expect(condition(0).label).toBe('Clear sky');
    expect(condition(97).label).toBe('Heavy thunderstorm');
    expect(condition(99).icon).toBe('thunderstorm-outline');
    expect(condition(12345).label).toBe('Unknown condition');
    expect(condition(null).label).toBe('Unknown condition');
  });
  it('selects supplied backgrounds for weather codes and nighttime', () => {
    expect(weatherBackground(0, '2026-10-28T12:00').src).toBe('assets/backgrounds/sunny.webp');
    expect(weatherBackground(0, '2026-10-28T12:00').contrast).toBe('light');
    expect(weatherBackground(63, '2026-10-28T12:00').src).toBe('assets/backgrounds/rain.jpeg');
    expect(weatherBackground(95, '2026-10-28T12:00').src).toBe('assets/backgrounds/thunderstorm.webp');
    expect(weatherBackground(0, '2026-10-28T22:00')).toMatchObject({
      src: 'assets/backgrounds/night.mp4',
      contrast: 'dark',
    });
  });
  it('builds the next hourly forecast window from the current model time', () => {
    const hours = hourlyForecasts({
      current: { time: '2026-10-28T02:00' },
      hourly: {
        time: ['2026-10-28T01:00', '2026-10-28T02:00', '2026-10-28T03:00'],
        temperature_2m: [25, 26, 27],
        precipitation_probability: [10, 20, 30],
      },
    });
    expect(hours).toHaveLength(2);
    expect(hours[0]).toMatchObject({ time: '2026-10-28T02:00', temperature: 26, rainProbability: 20 });
  });
  it('prioritizes severe weather and heat safety notices', () => {
    expect(weatherNotice({ current: { weather_code: 95, apparent_temperature: 40 } })?.title).toBe(
      'Severe weather reminder',
    );
    expect(weatherNotice({ current: { apparent_temperature: 38 } })?.message).toContain('Stay hydrated');
    expect(weatherNotice({ current: { uv_index: 8 } })?.title).toBe('High UV reminder');
    expect(weatherNotice({ current: { weather_code: 0 } })).toBeNull();
  });
  it('keeps date-only forecast labels on their original day', () => {
    expect(dayLabel('2026-10-28')).toBe('Wed, Oct 28');
    expect(dayLabel('bad')).toBe('Date unavailable');
    expect(modelTime('2026-10-28T00:15')).toContain('12:15');
    expect(modelTime(undefined)).toBe('Unavailable');
  });
  it('aligns partial daily arrays without losing zeros', () => {
    const days = dailyForecasts({
      daily: {
        time: ['2026-10-28', '2026-10-29'],
        weather_code: [0],
        temperature_2m_min: [0],
        precipitation_probability_max: [0],
      },
    });
    expect(days[0]).toEqual({ date: '2026-10-28', code: 0, minimum: 0, maximum: null, rainProbability: 0 });
    expect(days[1].code).toBeNull();
    expect(dailyForecasts({})).toEqual([]);
  });
});
