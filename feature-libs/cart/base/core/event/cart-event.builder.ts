import { Injectable, Type } from '@angular/core';
import { ofType } from '@ngrx/effects';
import { ActionsSubject } from '@ngrx/store';
import {
  ActiveCartFacade,
  CartAddEntryEvent,
  CartAddEntryFailEvent,
  CartAddEntrySuccessEvent,
  CartChangeEvent,
  CartRemoveEntryFailEvent,
  CartRemoveEntrySuccessEvent,
  CartUpdateEntryFailEvent,
  CartUpdateEntrySuccessEvent,
  CreateCartEvent,
  CreateCartFailEvent,
  CreateCartSuccessEvent,
  DeleteCartEvent,
  DeleteCartFailEvent,
  DeleteCartSuccessEvent,
  RemoveCartEvent,
} from '@spartacus/cart/base/root';
import {
  ActionToEventMapping,
  createFrom,
  EventService,
  StateEventService,
} from '@spartacus/core';
import { combineLatest, merge, Observable, of } from 'rxjs';
import {
  buffer,
  delay,
  filter,
  map,
  pairwise,
  startWith,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { CartActions } from '../store/index';

/**
 * Registers events for the active cart
 */
@Injectable({ providedIn: 'root' })
export class CartEventBuilder {
  constructor(
    protected actionsSubject: ActionsSubject,
    protected event: EventService,
    protected activeCartService: ActiveCartFacade,
    protected stateEventService: StateEventService
  ) {
    this.register();
  }

  /**
   * Registers events for the active cart
   */
  protected register() {
    this.registerCreateCart();
    this.registerAddEntry();
    this.registerRemoveEntry();
    this.registerUpdateEntry();
    this.registerCartChangeEvent();
    this.registerDeleteCart();
  }

  /**
   * Register events for adding entry to the active cart
   */
  protected registerAddEntry(): void {
    this.registerMapped({
      action: CartActions.CART_ADD_ENTRY,
      event: CartAddEntryEvent,
    });
    this.registerMapped({
      action: CartActions.CART_ADD_ENTRY_SUCCESS,
      event: CartAddEntrySuccessEvent,
    });
    this.registerMapped({
      action: CartActions.CART_ADD_ENTRY_FAIL,
      event: CartAddEntryFailEvent,
    });
  }

  protected registerRemoveEntry(): void {
    this.registerMapped({
      action: CartActions.CART_REMOVE_ENTRY_SUCCESS,
      event: CartRemoveEntrySuccessEvent,
    });
    this.registerMapped({
      action: CartActions.CART_REMOVE_ENTRY_FAIL,
      event: CartRemoveEntryFailEvent,
    });
  }

  protected registerUpdateEntry(): void {
    this.registerMapped({
      action: CartActions.CART_UPDATE_ENTRY_SUCCESS,
      event: CartUpdateEntrySuccessEvent,
    });
    this.registerMapped({
      action: CartActions.CART_UPDATE_ENTRY_FAIL,
      event: CartUpdateEntryFailEvent,
    });
  }

  protected registerCreateCart(): void {
    this.stateEventService.register({
      action: CartActions.CREATE_CART,
      event: CreateCartEvent,
    });
    this.stateEventService.register({
      action: CartActions.CREATE_CART_SUCCESS,
      event: CreateCartSuccessEvent,
    });
    this.stateEventService.register({
      action: CartActions.CREATE_CART_FAIL,
      event: CreateCartFailEvent,
    });
  }

  /**
   * Registers delete cart events
   */
  protected registerDeleteCart(): void {
    this.stateEventService.register({
      action: CartActions.DELETE_CART,
      event: DeleteCartEvent,
      factory: (action: CartActions.DeleteCart) =>
        createFrom(DeleteCartEvent, {
          ...action.payload,
          cartCode: action.payload.cartId,
        }),
    });

    this.stateEventService.register({
      action: CartActions.DELETE_CART_SUCCESS,
      event: DeleteCartSuccessEvent,
      factory: (action: CartActions.DeleteCartSuccess) =>
        createFrom(DeleteCartSuccessEvent, {
          ...action.payload,
          cartCode: action.payload.cartId,
        }),
    });

    this.stateEventService.register({
      action: CartActions.DELETE_CART_FAIL,
      event: DeleteCartFailEvent,
      factory: (action: CartActions.DeleteCartFail) =>
        createFrom(DeleteCartFailEvent, {
          ...action.payload,
          cartCode: action.payload.cartId,
        }),
    });
  }

  /**
   * Registers a stream of target events mapped from the source actions that contain the cart id equal to the active cart id.
   *
   * @param mapping mapping declaration - from `action` string type to `event` class type
   *   (an with optional `factory` function - by default `action.payload` will be assigned to the properties of the event instance).
   */
  protected registerMapped<T>(mapping: ActionToEventMapping<T>): () => void {
    const eventStream$ = this.getAction(mapping.action).pipe(
      switchMap((action) => {
        // SwitchMap was used instead of withLatestFrom, because we only want to subscribe to cart stream when action is dispatched.
        // Using withLatestFrom would trigger subscription to cart observables on event subscription and that causes side effects,
        // such as loading cart when we don't yet need it.
        return of(action).pipe(
          withLatestFrom(
            this.activeCartService.getActive(),
            this.activeCartService.getActiveCartId()
          )
        );
      }),
      filter(
        ([action, _activeCart, activeCartId]) =>
          action.payload['cartId'] === activeCartId
      ),
      map(([action, activeCart]) =>
        createFrom(mapping.event as Type<T>, {
          ...action.payload,
          cartCode: activeCart.code,
          entry: action.payload.entry
            ? action.payload.entry
            : activeCart.entries?.[Number(action.payload.entryNumber)],
        })
      )
    );
    return this.event.register(mapping.event as Type<T>, eventStream$);
  }

  protected registerCartChangeEvent(): void {
    const cartStream$ = this.activeCartService.getActive();

    const deleteCart$ = this.event.get(DeleteCartSuccessEvent);

    const cartChangeStream$ = merge(
      this.event.get(CreateCartSuccessEvent),
      deleteCart$,
      this.event.get(RemoveCartEvent),
      this.event.get(CartAddEntrySuccessEvent),
      this.event.get(CartRemoveEntrySuccessEvent),
      this.event.get(CartUpdateEntrySuccessEvent)
    ).pipe(
      buffer(
        combineLatest([cartStream$, deleteCart$.pipe(startWith(''), delay(0))])
      ),
      withLatestFrom(cartStream$.pipe(pairwise())),

      // tap({
      //   next: ([events, [previousCart, newCart]]) => {
      //     {
      //       console.group(`Cart Change Event ${events.length}`);

      //       {
      //         console.groupCollapsed(`old cart (${previousCart.totalUnitCount})`);
      //         console.log(previousCart);
      //         console.groupEnd();
      //       }

      //       events.forEach((event) => {
      //         console.log(event.constructor.name, event);
      //       });

      //       {
      //         console.groupCollapsed(`new cart (${newCart.totalUnitCount})`);
      //         console.log(newCart);
      //         console.groupEnd();
      //       }

      //       console.groupEnd();
      //     }
      //   },
      //   error: (x) => console.log('n', x),
      //   complete: () => console.log('c', '???'),
      // }),
      filter(([events]) => events.length > 0),
      map(([events, [previousCart, currentCart]]) =>
        createFrom(CartChangeEvent, {
          cartCode: currentCart.code ?? '',
          cartId: currentCart.guid ?? '',
          userId: currentCart.user?.uid ?? '',
          previousCart,
          currentCart,
          changes: events,
        })
      )
    );

    this.event.register(CartChangeEvent, cartChangeStream$);
  }

  /**
   * Returns a stream of actions only of a given type(s)
   *
   * @param actionType type(s) of actions
   */
  protected getAction(
    actionType: string | string[]
  ): Observable<{ type: string; payload?: any }> {
    return this.actionsSubject.pipe(
      ofType(...([] as string[]).concat(actionType))
    );
  }
}
