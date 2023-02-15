/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { NgModule } from '@angular/core';
import {
  customerTicketingTranslationChunksConfig,
  customerTicketingTranslations,
} from '@spartacus/customer-ticketing/assets';
import {
  CustomerTicketingRootModule,
  CUSTOMER_TICKETING_FEATURE,
} from '@spartacus/customer-ticketing/root';
import { CmsConfig, I18nConfig, provideConfig } from '@spartacus/core';

@NgModule({
  imports: [CustomerTicketingRootModule],
  providers: [
    provideConfig(<CmsConfig>{
      featureModules: {
        [CUSTOMER_TICKETING_FEATURE]: {
          module: () =>
            import('@spartacus/customer-ticketing').then(
              (m) => m.CustomerTicketingModule
            ),
        },
      },
    }),
    provideConfig(<I18nConfig>{
      i18n: {
        resources: customerTicketingTranslations,
        chunks: customerTicketingTranslationChunksConfig,
      },
    }),
  ],
})
export class CustomerTicketingFeatureModule {}
