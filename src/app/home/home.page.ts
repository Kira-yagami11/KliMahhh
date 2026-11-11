import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon, IonSelect, IonSelectOption, IonSpinner } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { arrowForwardOutline, locationOutline, peopleOutline, cloudOfflineOutline } from 'ionicons/icons';
import { BehaviorSubject } from 'rxjs';

import { PageHeaderComponent } from '../components/app/page-header/page-header.component';
import { SourceNoteComponent } from '../components/app/source-note/source-note.component';
import { WeatherPanelComponent } from '../components/app/weather-panel/weather-panel.component';
import { LOCATIONS, findLocation } from '../config/locations';
import type { WeatherRequest, WeatherState } from '../weather-services/weather.models';
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
  ],
})
export class HomePage {
  readonly locations = LOCATIONS;
  readonly selected = signal(LOCATIONS[0]);
  readonly state = signal<WeatherState>({ loading: true, error: null, snapshot: null });
  private readonly requests = new BehaviorSubject<WeatherRequest>({ location: LOCATIONS[0] });
  constructor() {
    addIcons({ arrowForwardOutline, locationOutline, peopleOutline, cloudOfflineOutline });
    inject(WeatherService)
      .watch(this.requests)
      .pipe(takeUntilDestroyed())
      .subscribe((state) => this.state.set(state));
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
