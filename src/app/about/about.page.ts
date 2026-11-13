import { Component, HostBinding, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IonCard, IonContent, IonItem, IonLabel, IonList } from '@ionic/angular';
import { of } from 'rxjs';

import { PageHeaderComponent } from '../components/app/page-header/page-header.component';
import { SourceNoteComponent } from '../components/app/source-note/source-note.component';
import { WeatherBackgroundComponent } from '../components/app/weather-background/weather-background.component';
import { LOCATIONS } from '../config/locations';
import { GROUP } from '../config/group';
import type { WeatherState } from '../weather-services/weather.models';
import { WeatherService } from '../weather-services/weather.service';
import { weatherContrast } from '../weather-services/weather.utils';

@Component({
  selector: 'app-about',
  styleUrls: ['about.page.scss'],
  imports: [
    IonCard,
    IonContent,
    IonItem,
    IonLabel,
    IonList,
    PageHeaderComponent,
    SourceNoteComponent,
    WeatherBackgroundComponent,
  ],
  templateUrl: './about.page.html',
})
export class AboutPage {
  readonly group = GROUP;
  readonly weatherState = signal<WeatherState>({ loading: true, error: null, snapshot: null });

  constructor() {
    inject(WeatherService)
      .watch(of({ location: LOCATIONS[0] }))
      .pipe(takeUntilDestroyed())
      .subscribe((state) => this.weatherState.set(state));
  }

  @HostBinding('class.weather-contrast-dark')
  get darkContrast(): boolean {
    return this.currentContrast() === 'dark';
  }

  @HostBinding('class.weather-contrast-light')
  get lightContrast(): boolean {
    return this.currentContrast() === 'light';
  }

  private currentContrast(): 'light' | 'dark' {
    const current = this.weatherState().snapshot?.data.current;
    return weatherContrast(current?.weather_code, current?.time);
  }
}
