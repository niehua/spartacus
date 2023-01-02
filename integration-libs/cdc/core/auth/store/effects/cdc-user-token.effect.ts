/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {
  GlobalMessageService,
  GlobalMessageType,
  normalizeHttpError,
} from '@spartacus/core';
import { EMPTY, Observable, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { CdcAuthService } from '../../facade/cdc-auth.service';
import { CdcUserAuthenticationTokenService } from '../../services/user-authentication/cdc-user-authentication-token.service';
import { CdcAuthActions } from '../actions/index';

@Injectable()
export class CdcUserTokenEffects {
  loadCdcUserToken$: Observable<CdcAuthActions.CdcUserTokenAction> =
    createEffect(() =>
      this.actions$.pipe(
        ofType(CdcAuthActions.LOAD_CDC_USER_TOKEN),
        map((action: CdcAuthActions.LoadCdcUserToken) => action.payload),
        mergeMap((payload) =>
          this.userTokenService
            .loadTokenUsingCustomFlow(
              payload.UID,
              payload.UIDSignature,
              payload.signatureTimestamp,
              payload.idToken,
              payload.baseSite
            )
            .pipe(
              switchMap((token) => {
                this.cdcAuthService.loginWithToken(token);
                return EMPTY;
              }),
              catchError((error) => {
                this.globalMessageService.add(
                  { key: 'httpHandlers.badGateway' },
                  GlobalMessageType.MSG_TYPE_ERROR
                );
                return of(
                  new CdcAuthActions.LoadCdcUserTokenFail({
                    error: normalizeHttpError(error),
                    initialActionPayload: payload,
                  })
                );
              })
            )
        )
      )
    );

  constructor(
    private actions$: Actions,
    private userTokenService: CdcUserAuthenticationTokenService,
    private globalMessageService: GlobalMessageService,
    private cdcAuthService: CdcAuthService
  ) {}
}
