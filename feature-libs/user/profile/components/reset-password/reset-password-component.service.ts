/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {
  GlobalMessageService,
  GlobalMessageType,
  HttpErrorModel,
  RouterState,
  RoutingService,
} from '@spartacus/core';
import { CustomFormValidators } from '@spartacus/storefront';
import { UserPasswordFacade } from '@spartacus/user/profile/root';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class ResetPasswordComponentService {
  constructor(
    protected userPasswordService: UserPasswordFacade,
    protected routingService: RoutingService,
    protected globalMessage: GlobalMessageService
  ) {}

  protected busy$ = new BehaviorSubject(false);

  isUpdating$ = this.busy$.pipe(
    tap((state) => (state === true ? this.form.disable() : this.form.enable()))
  );

  resetToken$: Observable<string> = this.routingService
    .getRouterState()
    .pipe(
      map((routerState: RouterState) => routerState.state.queryParams['token'])
    );

  form: UntypedFormGroup = new UntypedFormGroup(
    {
      password: new UntypedFormControl('', [
        Validators.required,
        CustomFormValidators.passwordValidator,
      ]),
      passwordConfirm: new UntypedFormControl('', Validators.required),
    },
    {
      validators: CustomFormValidators.passwordsMustMatch(
        'password',
        'passwordConfirm'
      ),
    }
  );

  /**
   * Resets the password by the given token.
   *
   * The token has been provided during the request password flow.
   * The token is not validated on the client.
   */
  resetPassword(token: string): void {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      return;
    }

    this.busy$.next(true);

    const password = (this.form.get('password') as UntypedFormControl).value;

    this.userPasswordService.reset(token, password).subscribe({
      next: () => this.onSuccess(),
      error: (error: unknown) => this.onError(error),
    });
  }

  protected onSuccess(): void {
    this.globalMessage.add(
      { key: 'forgottenPassword.passwordResetSuccess' },
      GlobalMessageType.MSG_TYPE_CONFIRMATION
    );
    this.busy$.next(false);
    this.form.reset();
    this.redirect();
  }

  protected onError(error: unknown): void {
    this.busy$.next(false);
    if (error instanceof HttpErrorModel) {
      (error.details ?? []).forEach((err) => {
        if (err.message) {
          this.globalMessage.add(
            { raw: err.message },
            GlobalMessageType.MSG_TYPE_ERROR
          );
        }
      });
    }
  }

  /**
   * Redirects the user to the login page.
   */
  protected redirect() {
    this.routingService.go({ cxRoute: 'login' });
  }
}
