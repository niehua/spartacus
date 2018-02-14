import { Injectable } from '@angular/core';

import { Effect, Actions } from '@ngrx/effects';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { map, catchError, mergeMap } from 'rxjs/operators';

import * as fromUserDetailsAction from '../actions/user-details.action';
import { OccUserService } from '../../../newocc/user/user.service';
import { UserDetails } from '../../models/user-details.model';


@Injectable()
export class UserDetailsEffects {
    @Effect()
    loadUserDetails$: Observable<any> = this.actions$
        .ofType(fromUserDetailsAction.LOAD_USER_DETAILS)
        .pipe(
            map((action: fromUserDetailsAction.LoadUserDetails) => action.payload),
            mergeMap((username) => {
                return this.occUserService.loadUser(username).pipe(
                    map((user: UserDetails) => {
                        return new fromUserDetailsAction.LoadUserDetailsSuccess(user);
                    }),
                    catchError(error =>
                        of(new fromUserDetailsAction.LoadUserDetailsFail(username))
                    )
                );
            })
        );

    constructor(
        private actions$: Actions,
        private occUserService: OccUserService,
    ) { }
}
