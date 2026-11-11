import { Component } from '@angular/core';
import { IonCard, IonContent, IonItem, IonLabel, IonList } from '@ionic/angular';

import { PageHeaderComponent } from '../components/app/page-header/page-header.component';
import { SourceNoteComponent } from '../components/app/source-note/source-note.component';
import { GROUP } from '../config/group';

@Component({
  selector: 'app-about',
  styleUrls: ['about.page.scss'],
  imports: [IonCard, IonContent, IonItem, IonLabel, IonList, PageHeaderComponent, SourceNoteComponent],
  templateUrl: './about.page.html',
})
export class AboutPage {
  readonly group = GROUP;
}
