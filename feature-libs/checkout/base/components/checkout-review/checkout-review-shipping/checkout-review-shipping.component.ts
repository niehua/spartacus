/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core';
import {
  ActiveCartFacade,
  CartItemComponentOptions,
  CartOutlets,
  DeliveryMode,
  OrderEntry,
} from '@spartacus/cart/base/root';
import {
  CheckoutDeliveryAddressFacade,
  CheckoutDeliveryModesFacade,
  CheckoutStepType,
} from '@spartacus/checkout/base/root';
import { Address, TranslationService } from '@spartacus/core';
import { Card, ICON_TYPE, OutletContextData } from '@spartacus/storefront';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { CheckoutStepService } from '../../services';

interface ShippingItemContext {
  readonly?: boolean;
  showItemList?: boolean;
  entries?: OrderEntry[];
  deliveryAddress?: Address;
  deliveryMode?: DeliveryMode;
  options?: CartItemComponentOptions;
}

@Component({
  selector: 'cx-checkout-review-shipping',
  templateUrl: './checkout-review-shipping.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutReviewShippingComponent implements OnInit, OnDestroy {
  @Input() readonly: boolean = false;
  @Input() showItemList: boolean = true;
  @Input() options: CartItemComponentOptions;

  readonly cartOutlets = CartOutlets;
  iconTypes = ICON_TYPE;

  deliveryAddressStepRoute = this.checkoutStepService.getCheckoutStepRoute(
    CheckoutStepType.DELIVERY_ADDRESS
  );
  deliveryModeStepRoute = this.checkoutStepService.getCheckoutStepRoute(
    CheckoutStepType.DELIVERY_MODE
  );

  protected subscription = new Subscription();

  constructor(
    protected activeCartFacade: ActiveCartFacade,
    protected checkoutDeliveryModesFacade: CheckoutDeliveryModesFacade,
    protected checkoutDeliveryAddressFacade: CheckoutDeliveryAddressFacade,
    protected translationService: TranslationService,
    protected checkoutStepService: CheckoutStepService,
    protected cd: ChangeDetectorRef,
    @Optional() protected outlet?: OutletContextData<ShippingItemContext>
  ) {}

  entries$: Observable<OrderEntry[]> =
    this.activeCartFacade.getDeliveryEntries();

  deliveryAddress$: Observable<Address | undefined> =
    this.checkoutDeliveryAddressFacade.getDeliveryAddressState().pipe(
      filter((state) => !state.loading && !state.error),
      map((state) => state.data)
    );

  deliveryMode$: Observable<DeliveryMode | undefined> =
    this.checkoutDeliveryModesFacade.getSelectedDeliveryModeState().pipe(
      filter((state) => !state.loading && !state.error),
      map((state) => state.data)
    );

  ngOnInit(): void {
    this.subscription.add(
      this.outlet?.context$.subscribe((context) => {
        if (context.readonly !== undefined) {
          this.readonly = context.readonly;
        }
        if (context.showItemList !== undefined) {
          this.showItemList = context.showItemList;
        }
        if (context.options) {
          this.options = context.options;
        }
        if (context.entries) {
          this.entries$ = of(context.entries);
        }
        if (context.deliveryAddress) {
          this.deliveryAddress$ = of(context.deliveryAddress);
        }
        if (context.deliveryMode) {
          this.deliveryMode$ = of(context.deliveryMode);
        }
        this.cd.markForCheck();
      })
    );
  }

  getDeliveryAddressCard(
    deliveryAddress: Address,
    countryName?: string
  ): Observable<Card> {
    return this.translationService.translate('addressCard.shipTo').pipe(
      map((textTitle) => {
        if (!countryName) {
          countryName = deliveryAddress?.country?.name as string;
        }

        let region = '';
        if (
          deliveryAddress &&
          deliveryAddress.region &&
          deliveryAddress.region.isocode
        ) {
          region = deliveryAddress.region.isocode + ', ';
        }

        return {
          title: textTitle,
          textBold: deliveryAddress.firstName + ' ' + deliveryAddress.lastName,
          text: [
            deliveryAddress.line1,
            deliveryAddress.line2,
            deliveryAddress.town + ', ' + region + countryName,
            deliveryAddress.postalCode,
            deliveryAddress.phone,
          ],
        } as Card;
      })
    );
  }

  getDeliveryModeCard(deliveryMode: DeliveryMode): Observable<Card> {
    return combineLatest([
      this.translationService.translate('checkoutMode.deliveryMethod'),
    ]).pipe(
      map(([textTitle]) => {
        return {
          title: textTitle,
          textBold: deliveryMode.name,
          text: [
            deliveryMode.description,
            deliveryMode.deliveryCost?.formattedValue
              ? deliveryMode.deliveryCost?.formattedValue
              : '',
          ],
        } as Card;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
