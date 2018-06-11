import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';  // replaces previous Http service
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { Step, StepperComponent, StepComponent } from './stepper/stepper.component';

@NgModule({
  declarations: [
    AppComponent,
    StepComponent,
    StepperComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
