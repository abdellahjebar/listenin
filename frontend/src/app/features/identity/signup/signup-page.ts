import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthLayout } from '../auth-layout';
import { SignupForm } from './signup-form';

/** Page d'inscription : bloc Spartan « signup-two-column », contenu adapté à ListenIn. */
@Component({
  selector: 'app-signup-page',
  imports: [AuthLayout, SignupForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth-layout>
      <app-signup-form />
    </app-auth-layout>
  `,
})
export default class SignupPage {}
