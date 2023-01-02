/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { PaymentDetails } from '../../../model/payment.model';
import { normalizeHttpError } from '../../../util/normalize-http-error';
import { UserPaymentConnector } from '../../connectors/payment/user-payment.connector';
import { UserActions } from '../actions/index';
import { GlobalMessageService } from '../../../global-message/facade/global-message.service';
import { GlobalMessageType } from '../../../global-message/models/global-message.model';

@Injectable()
export class UserPaymentMethodsEffects {
  loadUserPaymentMethods$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.LOAD_USER_PAYMENT_METHODS),
      map((action: UserActions.LoadUserPaymentMethods) => action.payload),
      mergeMap((payload) => {
        return this.userPaymentMethodConnector.getAll(payload).pipe(
          map((payments: PaymentDetails[]) => {
            return new UserActions.LoadUserPaymentMethodsSuccess(payments);
          }),
          catchError((error) =>
            of(
              new UserActions.LoadUserPaymentMethodsFail(
                normalizeHttpError(error)
              )
            )
          )
        );
      })
    )
  );

  setDefaultUserPaymentMethod$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.SET_DEFAULT_USER_PAYMENT_METHOD),
      map((action: UserActions.SetDefaultUserPaymentMethod) => action.payload),
      mergeMap((payload) => {
        return this.userPaymentMethodConnector
          .setDefault(payload.userId, payload.paymentMethodId)
          .pipe(
            switchMap((data) => [
              new UserActions.SetDefaultUserPaymentMethodSuccess(data),
              new UserActions.LoadUserPaymentMethods(payload.userId),
            ]),
            catchError((error) =>
              of(
                new UserActions.SetDefaultUserPaymentMethodFail(
                  normalizeHttpError(error)
                )
              )
            )
          );
      })
    )
  );

  deleteUserPaymentMethod$: Observable<Action> = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.DELETE_USER_PAYMENT_METHOD),
      map((action: UserActions.DeleteUserPaymentMethod) => action.payload),
      mergeMap((payload) => {
        return this.userPaymentMethodConnector
          .delete(payload.userId, payload.paymentMethodId)
          .pipe(
            switchMap((data) => {
              this.globalMessageService.add(
                { key: 'paymentCard.deletePaymentSuccess' },
                GlobalMessageType.MSG_TYPE_CONFIRMATION
              );
              return [
                new UserActions.DeleteUserPaymentMethodSuccess(data),
                new UserActions.LoadUserPaymentMethods(payload.userId),
              ];
            }),
            catchError((error) =>
              of(
                new UserActions.DeleteUserPaymentMethodFail(
                  normalizeHttpError(error)
                )
              )
            )
          );
      })
    )
  );

  constructor(
    private actions$: Actions,
    private userPaymentMethodConnector: UserPaymentConnector,
    private globalMessageService: GlobalMessageService
  ) {}
}
