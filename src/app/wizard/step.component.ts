import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'step',
  template: `
<div class="wizard-pf-steps" *ngIf="steps">
  <ul class="wizard-pf-steps-indicator">
    <li class="wizard-pf-step" [class.active]="stepIndex == i + 1" *ngFor="let step of steps; let i = index">
      <a (click)="onclicked(i + 1)">
        <span class="wizard-pf-step-number">{{i + 1}}</span>
        <span class="hidden-xs wizard-pf-step-title">{{step}}</span>
      </a>
    </li>
    <li class="wizard-pf-step" [class.active]="stepIndex == steps.length + 1">
      <span class="wizard-pf-step-number">
        {{steps.length + 1}}
      </span>
      <span class="hidden-xs wizard-pf-step-title">Review</span>
    </li>
  </ul>
</div>
  `
})
export class StepComponent {
  @Input() steps: string[];
  @Input() stepIndex: number;
  @Output() onclick = new EventEmitter<number>();

  onclicked(index: number) {
    this.onclick.emit(index);
  }
}

