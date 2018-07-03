import { Component } from '@angular/core';
import { Step } from './stepper/stepper.component';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

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

  title = 'Employee admission';

  step1Form: FormGroup;

  firstName = new FormControl('', Validators.required);

  constructor(fb: FormBuilder) {
      this.step1Form = fb.group({
          'firstName': this.firstName,
          'lastName': ['', Validators.required]
      });
  }

  onStep1Submit() {
      console.log('model-based form submitted');
      console.log(this.step1Form);
  }

  step1Completed = function() {
    this.step1.completed = (this.person.name !== undefined && this.person.name !== '');
    return this.step1.completed;
  };
}
