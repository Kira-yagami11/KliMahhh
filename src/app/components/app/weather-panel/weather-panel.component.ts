import { Component, Input } from '@angular/core';
import { IonCard, IonIcon, IonItem, IonLabel, IonList } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  cloudOutline,
  helpCircleOutline,
  partlySunnyOutline,
  rainyOutline,
  snowOutline,
  sunnyOutline,
  thunderstormOutline,
  thermometerOutline,
  waterOutline,
  flagOutline,
} from 'ionicons/icons';

import type { WeatherSnapshot } from '../../../weather-services/weather.models';
import { condition, dayLabel, hourLabel, measurement, modelTime, retrievalTime } from '../../../weather-services/weather.utils';

@Component({
  selector: 'app-weather-panel',
  imports: [IonCard, IonIcon, IonItem, IonLabel, IonList],
  templateUrl: './weather-panel.component.html',
  styleUrls: ['./weather-panel.component.scss'],
})
export class WeatherPanelComponent {
  @Input({ required: true }) snapshot!: WeatherSnapshot;
  @Input() details = false;
  readonly condition = condition;
  readonly measurement = measurement;
  readonly dayLabel = dayLabel;
  readonly modelTime = modelTime;
  readonly hourLabel = hourLabel;
  readonly retrievalTime = retrievalTime;
  constructor() {
    addIcons({
      cloudOutline,
      helpCircleOutline,
      partlySunnyOutline,
      rainyOutline,
      snowOutline,
      sunnyOutline,
      thunderstormOutline,
      thermometerOutline,
      waterOutline,
      flagOutline,
    });
  }
}
