import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthLayout } from '../auth-layout';
import { LoginForm } from './login-form';

/** Page de connexion : bloc Spartan « login-two-column », contenu adapté à ListenIn. */
@Component({
  selector: 'app-login-page',
  imports: [AuthLayout, LoginForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-auth-layout>
      <app-login-form />
    </app-auth-layout>
  `,
})
export default class LoginPage {}
