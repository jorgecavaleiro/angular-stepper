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

  name = '';

  constructor() {
    // init;
    // this.step1.completed = true;
  }

  step1Completed = function() {
    console.log('entering step 1 completed');
    this.step1.completed = (this.name !== undefined && this.name !== '');
    return this.step1.completed;
  };
}
