import { Component } from '@angular/core';
import { Step } from './stepper/stepper.component';
export class Person {

  constructor(
    public id: number,
    public name: string,
    public address: string,
  ) {  }

}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  person: Person;
  step1: Step;
  step2: Step;

  constructor() {
    // init;
    // this.step1.completed = true;
    this.person = new Person(0, '', '');
    this.step1 = new Step('', '');
    this.step2 = new Step('', '');
  }

  step1Completed = function() {
    this.step1.completed = (this.person.name !== undefined && this.person.name !== '');
    return this.step1.completed;
  };
}
