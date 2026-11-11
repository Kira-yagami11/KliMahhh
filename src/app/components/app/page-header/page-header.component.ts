import { Component, Input, signal } from '@angular/core';
import { IonBackButton, IonButton, IonButtons, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { moonOutline, sunnyOutline } from 'ionicons/icons';

@Component({
  selector: 'app-page-header',
  imports: [IonBackButton, IonButton, IonButtons, IonHeader, IonIcon, IonTitle, IonToolbar],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent {
  @Input() title = 'KliMahhh';
  @Input() back = false;
  readonly darkMode = signal(false);

  constructor() {
    addIcons({ moonOutline, sunnyOutline });
    const dark = localStorage.getItem('ecija-weather-theme') === 'dark';
    this.darkMode.set(dark);
    this.applyTheme(dark);
  }

  toggleDarkMode(): void {
    const dark = !this.darkMode();
    this.darkMode.set(dark);
    localStorage.setItem('ecija-weather-theme', dark ? 'dark' : 'light');
    this.applyTheme(dark);
  }

  private applyTheme(dark: boolean): void {
    document.documentElement.classList.toggle('ion-palette-dark', dark);
  }
}
