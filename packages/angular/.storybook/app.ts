/* eslint-disable typescript/no-extraneous-class -- Angular needs a bootstrap component. */
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
  selector: 'fluxdown-storybook',
  template: '',
})
class StorybookApp {}

void bootstrapApplication(StorybookApp);
