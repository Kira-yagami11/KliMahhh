import { Component, Input } from '@angular/core';

import type { WeatherSnapshot } from '../../../weather-services/weather.models';
import { weatherBackground } from '../../../weather-services/weather.utils';

@Component({
  selector: 'app-weather-background',
  templateUrl: './weather-background.component.html',
  styleUrls: ['./weather-background.component.scss'],
  standalone: true,
})
export class WeatherBackgroundComponent {
  @Input() snapshot: WeatherSnapshot | null = null;
  readonly weatherBackground = weatherBackground;
}
