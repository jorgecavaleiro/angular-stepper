import { Component, EventEmitter, OnInit, Input, Output, ViewChild,
  ViewChildren, QueryList, AfterViewInit, AfterContentInit, ContentChildren, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

// ---------------------------------------------------------------
//   <app-step>
// ---------------------------------------------------------------

export class Step {
  // public properties
  public name: string;
  public index: number;
  public title: string;
  public selected: boolean;
  public completed: boolean;
  public enabled: boolean;
  public src: string;
  public content: string;

  // constructor
  constructor(name: string, title: string) {
    this.name = name;
    this.title = title;
    this.completed = false;
  }
}

@Component({
  selector: 'app-step',
  templateUrl: './step.component.html',
  styleUrls: ['./stepper.component.css']
})

export class StepComponent implements OnInit {

  // Private Members

  private _step: Step;
  private _index: number;

  // @Input and @Output

  @Input() name: string;
  @Input() title: string;

  get completed(): boolean {
    return this._step.completed;
  }
  @Input('completed')
  set completed(value: boolean) {
    if (this._step === undefined) {
      return;
    }
    if (value) {
      console.log(`step ${name} has completed`);
    }
    this._step.completed = value;
  }

  @Output() onselect = new EventEmitter<string>();
  @Output() oncompleted = new EventEmitter<string>();

  // Getters

  get index(): number {
    return this._index;
  }

  get step(): Step {
    return this._step;
  }

  // Constructors

  constructor() {
  }

  // OnInit interface implementation

  ngOnInit() {
    this._step = new Step(this.name, this.title);
  }

  // Public Methods

  select() {
    if (!this._step.selected && !this._step.enabled) {
      return;
    }
    this.onselect.emit(this._step.name);
    this._step.selected = true;
  }

  setIndex(idx: number) {
    this._index = idx;
  }

  getStepSelectedEmitter() {
    return this.onselect;
  }
}

// ---------------------------------------------------------------
//   <app-stepper>
// ---------------------------------------------------------------

@Component({
  selector: 'app-stepper',
  template: `
    <div class="stepper">
      <app-step *ngFor="let s of steps" (onselect)="onStepSelected($event)"></app-step>
      <ng-content></ng-content>
    </div>`,
  styleUrls: ['./stepper.component.css']
})

export class StepperComponent implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {
  // Input parameters
  @Input() steps: Step[];

  @ContentChildren(StepComponent) stepComponents: QueryList<StepComponent>;

  // Private members
  currentStep: number;
  allSteps: Step[] = [];
  subscriptions: EventEmitter<string>[] = [];

  // Constructors
  constructor(private http: HttpClient) {
    this.currentStep = 0;
  }

  onStepSelected(name: string) {
    this.allSteps.forEach(el  => {
      if (el.name !== name) {
        el.selected = false;
      }
    });
  }

  // OnInit interface implementation
  ngOnInit() {
  }

  ngAfterContentInit() {
    console.log('entering after content init event..');

    const contentStepsComponents: StepComponent[] = this.stepComponents.toArray();
    console.log(contentStepsComponents);

    contentStepsComponents.forEach((el, idx) => {
      el.setIndex(idx);

      this.allSteps.push(el.step);

      // check first step
      if (idx === 0) {
        el.step.selected = true;
        el.step.enabled = true;
        el.step.completed = true;
        console.log('step selected:');
        console.log(el.step);
      }

      // subscribe to the OnSelect event
      this.subscriptions.push(el.getStepSelectedEmitter());
      this.subscriptions[idx].subscribe(item => this.onStepSelected(item));
    });
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      s.unsubscribe();
    });
  }
}
