import { Component, HostBinding, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { refreshOutline } from 'ionicons/icons';
import { BehaviorSubject, combineLatest, map, of, switchMap } from 'rxjs';

import { PageHeaderComponent } from '../components/app/page-header/page-header.component';
import { SourceNoteComponent } from '../components/app/source-note/source-note.component';
import { WeatherPanelComponent } from '../components/app/weather-panel/weather-panel.component';
import { WeatherBackgroundComponent } from '../components/app/weather-background/weather-background.component';
import { findLocation } from '../config/locations';
import type { WeatherState } from '../weather-services/weather.models';
import { WeatherService } from '../weather-services/weather.service';
import { weatherContrast } from '../weather-services/weather.utils';

@Component({
  selector: 'app-details',
  styleUrls: ['details.page.scss'],
  imports: [
    RouterLink,
    IonButton,
    IonContent,
    IonIcon,
    IonSpinner,
    PageHeaderComponent,
    SourceNoteComponent,
    WeatherPanelComponent,
    WeatherBackgroundComponent,
  ],
  templateUrl: './details.page.html',
})
export class DetailsPage {
  readonly location = signal<ReturnType<typeof findLocation>>(undefined);
  readonly state = signal<WeatherState>({ loading: true, error: null, snapshot: null });
  private readonly refreshRequests = new BehaviorSubject<void>(undefined);
  constructor() {
    addIcons({ refreshOutline });
    const service = inject(WeatherService);
    combineLatest([inject(ActivatedRoute).paramMap, this.refreshRequests])
      .pipe(
        map(([params]) => findLocation(params.get('locationId'))),
        switchMap((location) => {
          this.location.set(location);
          return location
            ? service.watch(of({ location }))
            : of<WeatherState>({ loading: false, error: null, snapshot: null });
        }),
        takeUntilDestroyed(),
      )
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
  refresh(): void {
    if (!this.state().loading) this.refreshRequests.next();
  }
}
