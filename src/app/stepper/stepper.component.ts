import { Component, EventEmitter, OnInit, Input, Output, ViewChild,
  ViewChildren, QueryList, AfterViewInit, AfterContentInit, ContentChildren, OnDestroy } from '@angular/core';

// ---------------------------------------------------------------
//   Step class
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
  public lastStep: boolean;
  public firstStep: boolean;

  // constructor
  constructor(name: string, title: string) {
    this.index = -1;
    this.name = name;
    this.title = title;
    this.completed = false;
    this.lastStep = false;
  }
}

// ---------------------------------------------------------------
//   <app-step> Component
// ---------------------------------------------------------------

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
  @Input() canMoveNext: boolean;
  @Input() mainActionTitle: string;

  get completed(): boolean {
    return this._step.completed;
  }
  @Input('completed')
  set completed(value: boolean) {
    if (this._step === undefined) {
      return;
    }
    if (value) {
      this.oncomplete.emit(this._step);
    }
    this._step.completed = value;
  }

  @Output() onselect = new EventEmitter<string>();
  @Output() oncomplete = new EventEmitter<Step>();
  @Output() onnextstep = new EventEmitter<Step>();
  @Output() onpreviousstep = new EventEmitter<Step>();

  // Getters

  get index(): number {
    return this._index;
  }

  get step(): Step {
    return this._step;
  }

  // Constructors

  constructor() {
    this.mainActionTitle = 'Next';
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
    this.onnextstep.emit(this._step);
  }

  back() {
    console.log('return to previous step...');
    if (this._step === undefined || (!this._step.selected && !this._step.enabled) ) {
      return;
    }
    this.onpreviousstep.emit(this._step);
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

  getPreviousStepEmitter() {
    return this.onpreviousstep;
  }
}

// ---------------------------------------------------------------
//   <app-stepper>
// ---------------------------------------------------------------

@Component({
  selector: 'app-stepper',
  template: `
    <div class="stepper">
      <ng-content></ng-content>
      <app-step *ngFor="let s of steps" (onselect)="onStepSelected($event)" (oncomplete)="onStepCompleted($event)"></app-step>
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
  constructor() {
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
    this._stepComponents.forEach((el, idx) => {
      if (idx === step.index + 1) {
        el.step.enabled = true;
      }
    });
  }

  // When next step action resquested, if the current step is completed, then selects the next
  onNextStep(step: Step) {
    if (step.index < this._stepComponents.length - 1) {

      const currentStepComponent = this._stepComponents[step.index];
      const nextStepComponent = this._stepComponents[step.index + 1];

      let canCont = currentStepComponent.step.completed;

      if (canCont && currentStepComponent.canMoveNext !== undefined && currentStepComponent.canMoveNext != null) {
        canCont = currentStepComponent.canMoveNext;
      }

      if (canCont) {
        nextStepComponent.step.enabled = true;
        nextStepComponent.select();
      } else {
        console.log('must complete current step before move to next!');
      }
    }
  }

  // When previous step action resquested
  onPreviousStep(step: Step) {
    if (step.index > 0) {
      const currentStepComponent = this._stepComponents[step.index];
      const previousStepComponent = this._stepComponents[step.index - 1];
      previousStepComponent.select();
    }
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
        el.step.firstStep = true;
      }

      // check last step
      if (idx === this.stepComponents.length - 1) {
        el.step.lastStep = true;
      }

      // subscribe to the OnSelect event
      let i = this._subscriptions.push(el.getStepSelectedEmitter());
      this._subscriptions[i - 1].subscribe(item => this.onStepSelected(item));

      // subscribe to the OnComplete event
      i = this._subscriptions.push(el.getStepCompletedEmitter());
      this._subscriptions[i - 1].subscribe(item => this.onStepCompleted(item));

      // subscribe to the next step action event
      i = this._subscriptions.push(el.getNextStepEmitter());
      this._subscriptions[i - 1].subscribe(item => this.onNextStep(item));

      // subscribe to the next step action event
      i = this._subscriptions.push(el.getPreviousStepEmitter());
      this._subscriptions[i - 1].subscribe(item => this.onPreviousStep(item));
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
