/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChangeDetectionStrategy, Component, Optional } from '@angular/core';
import {
  ActiveCartFacade,
  Cart,
  CartOutlets,
  DeliveryMode,
  OrderEntry,
  PaymentDetails,
  PromotionLocation,
} from '@spartacus/cart/base/root';
import {
  CheckoutDeliveryAddressFacade,
  CheckoutDeliveryModesFacade,
  CheckoutPaymentFacade,
  CheckoutStep,
  CheckoutStepType,
} from '@spartacus/checkout/base/root';
import {
  Address,
  FeatureConfigService,
  TranslationService,
} from '@spartacus/core';
import { Card, getAddressNumbers, ICON_TYPE } from '@spartacus/storefront';
import { combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { CheckoutStepService } from '../services/checkout-step.service';

@Component({
  selector: 'cx-review-submit',
  templateUrl: './checkout-review-submit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutReviewSubmitComponent {
  readonly cartOutlets = CartOutlets;
  iconTypes = ICON_TYPE;

  checkoutStepTypeDeliveryAddress = CheckoutStepType.DELIVERY_ADDRESS;
  checkoutStepTypePaymentDetails = CheckoutStepType.PAYMENT_DETAILS;
  checkoutStepTypeDeliveryMode = CheckoutStepType.DELIVERY_MODE;

  promotionLocation: PromotionLocation = PromotionLocation.ActiveCart;

  /**
   * TODO: (#CXSPA-53) Remove featureConfigService from constructor in 6.0.
   */
  constructor(
    protected checkoutDeliveryAddressFacade: CheckoutDeliveryAddressFacade,
    protected checkoutPaymentFacade: CheckoutPaymentFacade,
    protected activeCartFacade: ActiveCartFacade,
    protected translationService: TranslationService,
    protected checkoutStepService: CheckoutStepService,
    protected checkoutDeliveryModesFacade: CheckoutDeliveryModesFacade,
    @Optional() protected featureConfigService?: FeatureConfigService
  ) {}

  get cart$(): Observable<Cart> {
    return this.activeCartFacade.getActive();
  }

  get entries$(): Observable<OrderEntry[]> {
    return this.activeCartFacade.getEntries();
  }

  protected getCheckoutDeliverySteps(): Array<CheckoutStepType | string> {
    return [CheckoutStepType.DELIVERY_ADDRESS, CheckoutStepType.DELIVERY_MODE];
  }

  protected getCheckoutPaymentSteps(): Array<CheckoutStepType | string> {
    return [
      CheckoutStepType.PAYMENT_DETAILS,
      CheckoutStepType.DELIVERY_ADDRESS,
    ];
  }

  steps$: Observable<CheckoutStep[]> = this.checkoutStepService.steps$;

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

  paymentDetails$: Observable<PaymentDetails | undefined> =
    this.checkoutPaymentFacade.getPaymentDetailsState().pipe(
      filter((state) => !state.loading && !state.error),
      map((state) => state.data)
    );

  getDeliveryAddressCard(
    deliveryAddress: Address,
    countryName?: string
  ): Observable<Card> {
    return combineLatest([
      this.translationService.translate('addressCard.shipTo'),
      this.translationService.translate('addressCard.phoneNumber'),
      this.translationService.translate('addressCard.mobileNumber'),
    ]).pipe(
      map(([textTitle, textPhone, textMobile]) => {
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

        /**
         * TODO: (#CXSPA-53) Remove feature config check in 6.0.
         */
        const numbers = this.featureConfigService?.isLevel('5.2')
          ? getAddressNumbers(deliveryAddress, textPhone, textMobile)
          : deliveryAddress.phone;

        return {
          title: textTitle,
          textBold: deliveryAddress.firstName + ' ' + deliveryAddress.lastName,
          text: [
            deliveryAddress.line1,
            deliveryAddress.line2,
            deliveryAddress.town + ', ' + region + countryName,
            deliveryAddress.postalCode,
            numbers,
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

  getPaymentMethodCard(paymentDetails: PaymentDetails): Observable<Card> {
    return combineLatest([
      this.translationService.translate('paymentForm.payment'),
      this.translationService.translate('paymentCard.expires', {
        month: paymentDetails.expiryMonth,
        year: paymentDetails.expiryYear,
      }),
      this.translationService.translate('paymentForm.billingAddress'),
    ]).pipe(
      map(([textTitle, textExpires, billingAddress]) => {
        const region = paymentDetails.billingAddress?.region?.isocode
          ? paymentDetails.billingAddress?.region?.isocode + ', '
          : '';
        return {
          title: textTitle,
          textBold: paymentDetails.accountHolderName,
          text: [paymentDetails.cardNumber, textExpires],
          paragraphs: [
            {
              title: billingAddress + ':',
              text: [
                paymentDetails.billingAddress?.firstName +
                  ' ' +
                  paymentDetails.billingAddress?.lastName,
                paymentDetails.billingAddress?.line1,
                paymentDetails.billingAddress?.town +
                  ', ' +
                  region +
                  paymentDetails.billingAddress?.country?.isocode,
                paymentDetails.billingAddress?.postalCode,
              ],
            },
          ],
        } as Card;
      })
    );
  }

  getCheckoutStepUrl(stepType: CheckoutStepType | string): string | undefined {
    const step = this.checkoutStepService.getCheckoutStep(
      stepType as CheckoutStepType
    );
    return step?.routeName;
  }

  deliverySteps(steps: CheckoutStep[]): CheckoutStep[] {
    return steps.filter((step) =>
      this.getCheckoutDeliverySteps().includes(step.type[0])
    );
  }

  paymentSteps(steps: CheckoutStep[]): CheckoutStep[] {
    return steps.filter((step) =>
      this.getCheckoutPaymentSteps().includes(step.type[0])
    );
  }
}
