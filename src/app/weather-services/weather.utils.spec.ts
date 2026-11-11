import { condition, dailyForecasts, dayLabel, measurement, modelTime } from './weather.utils';

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
