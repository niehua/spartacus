/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { provideDefaultConfig } from '@spartacus/core';
import { FormErrorsModule } from '@spartacus/storefront';
import { CustomerTicketingCloseModule } from './details/customer-ticketing-close';
import { CustomerTicketingCreateModule } from './list/customer-ticketing-create';
import { defaultCustomerTicketingFormLayoutConfig } from './shared/customer-ticketing-dialog';
import { CustomerTicketingListModule } from './list/customer-ticketing-list';
import { CustomerTicketingDetailsModule } from './details/customer-ticketing-details';
import { CustomerTicketingReopenModule } from './details/customer-ticketing-reopen';
import { CustomerTicketingMessagesModule } from './details/customer-ticketing-messages';

@NgModule({
  imports: [
    ReactiveFormsModule,
    FormErrorsModule,
    CustomerTicketingDetailsModule,
    CustomerTicketingCloseModule,
    CustomerTicketingReopenModule,
    CustomerTicketingListModule,
    CustomerTicketingMessagesModule,
    CustomerTicketingCreateModule,
  ],
  providers: [provideDefaultConfig(defaultCustomerTicketingFormLayoutConfig)],
})
export class CustomerTicketingComponentsModule {}
