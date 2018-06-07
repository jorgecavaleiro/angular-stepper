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
    this.index = -1;
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

  // Public properties
  public nextStepPending: boolean;

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
      this.oncomplete.emit(this._step);
      if (this.nextStepPending) {
        this.nextStepPending = false;
      }
    }
    this._step.completed = value;
  }

  @Output() onselect = new EventEmitter<string>();
  @Output() oncomplete = new EventEmitter<Step>();
  @Output() onnextstep = new EventEmitter<Step>();

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
    if (this._step === undefined || (!this._step.selected && !this._step.enabled) ) {
      return;
    }
    this.onselect.emit(this._step.name);
    this._step.selected = true;
  }

  next() {
    console.log('entering next action...');
    if (this._step === undefined || (!this._step.selected && !this._step.enabled) ) {
      return;
    }
    console.log('go to the next step pending...');
    this.nextStepPending = true;
    this.onnextstep.emit(this._step);
  }

  setIndex(idx: number) {
    this._index = idx;
    this._step.index = idx;
  }

  getStepSelectedEmitter() {
    return this.onselect;
  }

  getStepCompletedEmitter() {
    return this.oncomplete;
  }

  getNextStepEmitter() {
    return this.onnextstep;
  }
}

// ---------------------------------------------------------------
//   <app-stepper>
// ---------------------------------------------------------------

@Component({
  selector: 'app-stepper',
  template: `
    <div class="stepper">
      <app-step *ngFor="let s of steps" (onselect)="onStepSelected($event)" (oncomplete)="onStepCompleted($event)"></app-step>
      <ng-content></ng-content>
    </div>`,
  styleUrls: ['./stepper.component.css']
})

export class StepperComponent implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {
  // Input parameters
  @Input() steps: Step[];

  @ContentChildren(StepComponent) stepComponents: QueryList<StepComponent>;

  // Private members
  private _currentStepIdx: number;
  private _allSteps: Step[] = [];
  private _subscriptions: EventEmitter<any>[] = [];
  private _stepComponents: StepComponent[];

  // Constructors
  constructor(private http: HttpClient) {
    this._currentStepIdx = 0;
  }

  // When some step is selected all other must be unselected
  onStepSelected(name: string) {
    this._allSteps.forEach((el, idx)  => {
      if (el.name !== name) {
        el.selected = false;
      } else {
        this._currentStepIdx = idx;
      }
    });
  }

  // When some step has completed the next one becomes available
  onStepCompleted(step: Step) {
    console.log('step completed message received, for step:');
    console.log(step);

    this._stepComponents.forEach((el, idx) => {
      if (idx === step.index + 1) {
        console.log(`step ${el.index} is now enabled`);
        el.step.enabled = true;
        el.select();
      }
    });
  }

  // OnInit interface implementation
  ngOnInit() {
  }

  ngAfterContentInit() {
    console.log('entering after content init event..');

    this._stepComponents = this.stepComponents.toArray();

    this._stepComponents.forEach((el, idx) => {
      el.setIndex(idx);

      this._allSteps.push(el.step);

      // check first step
      if (idx === 0) {
        el.step.selected = true;
        el.step.enabled = true;
        el.step.completed = true;
        console.log('step selected:');
        console.log(el.step);
      }

      // subscribe to the OnSelect event
      let i = this._subscriptions.push(el.getStepSelectedEmitter());
      this._subscriptions[i - 1].subscribe(item => this.onStepSelected(item));

      // subscribe to the OnComplete event
      i = this._subscriptions.push(el.getStepCompletedEmitter());
      this._subscriptions[i - 1].subscribe(item => this.onStepCompleted(item));
    });
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    this._subscriptions.forEach(s => {
      s.unsubscribe();
    });
  }
}
