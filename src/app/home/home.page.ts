import { Component, HostBinding, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonSelect, IonSelectOption, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowForwardOutline,
  locationOutline,
  peopleOutline,
  cloudOfflineOutline,
  warningOutline,
  waterOutline,
  sunnyOutline,
  rainyOutline,
} from 'ionicons/icons';
import { BehaviorSubject } from 'rxjs';

import { PageHeaderComponent } from '../components/app/page-header/page-header.component';
import { SourceNoteComponent } from '../components/app/source-note/source-note.component';
import { WeatherPanelComponent } from '../components/app/weather-panel/weather-panel.component';
import { WeatherBackgroundComponent } from '../components/app/weather-background/weather-background.component';
import { LOCATIONS, findLocation } from '../config/locations';
import type { WeatherRequest, WeatherState } from '../weather-services/weather.models';
import { weatherContrast, weatherNotice } from '../weather-services/weather.utils';
import { WeatherService } from '../weather-services/weather.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    RouterLink,
    IonButton,
    IonContent,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    PageHeaderComponent,
    SourceNoteComponent,
    WeatherPanelComponent,
    WeatherBackgroundComponent,
  ],
})
export class HomePage {
  readonly locations = LOCATIONS;
  readonly selected = signal(LOCATIONS[0]);
  readonly state = signal<WeatherState>({ loading: true, error: null, snapshot: null });
  readonly weatherNotice = weatherNotice;
  private readonly requests = new BehaviorSubject<WeatherRequest>({ location: LOCATIONS[0] });
  constructor() {
    addIcons({
      arrowForwardOutline,
      locationOutline,
      peopleOutline,
      cloudOfflineOutline,
      warningOutline,
      waterOutline,
      sunnyOutline,
      rainyOutline,
    });
    inject(WeatherService)
      .watch(this.requests)
      .pipe(takeUntilDestroyed())
      .subscribe((state) => this.state.set(state));
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
    const current = this.state().snapshot?.data.current;
    return weatherContrast(current?.weather_code, current?.time);
  }
  selectLocation(id: string): void {
    const location = findLocation(id);
    if (!location || location.id === this.selected().id) return;
    this.selected.set(location);
    this.requests.next({ location });
  }
  retry(): void {
    if (!this.state().loading) this.requests.next({ location: this.selected() });
  }
}
