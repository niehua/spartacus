/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  CmsConfig,
  I18nModule,
  provideDefaultConfig,
} from '@spartacus/core';
import { CartSharedModule } from '../cart-shared/cart-shared.module';
import { SaveForLaterComponent } from './save-for-later.component';

@NgModule({
  imports: [CommonModule, I18nModule, CartSharedModule],
  providers: [
    provideDefaultConfig(<CmsConfig>{
      cmsComponents: {
        SaveForLaterComponent: {
          component: SaveForLaterComponent,
        },
      },
    }),
  ],
  declarations: [SaveForLaterComponent],
  exports: [SaveForLaterComponent],
})
export class SaveForLaterModule {}
