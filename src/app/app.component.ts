import { Component } from '@angular/core';
import { Step } from './stepper/stepper.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  step1: Step = new Step('ComppanyData', 'Company Data');

  constructor() {
    // init;
  }
}
