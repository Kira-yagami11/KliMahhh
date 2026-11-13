import { Component, Input } from '@angular/core';
import { IonBackButton, IonButtons, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';

@Component({
  selector: 'app-page-header',
  imports: [IonBackButton, IonButtons, IonHeader, IonTitle, IonToolbar],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent {
  @Input() title = 'KliMahhh';
  @Input() back = false;
}
