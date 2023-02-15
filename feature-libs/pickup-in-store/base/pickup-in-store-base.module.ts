/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { NgModule } from '@angular/core';
import { PickupInStoreComponentsModule } from '@spartacus/pickup-in-store/base/components';
import { PickupInStoreBaseCoreModule } from '@spartacus/pickup-in-store/base/core';
import { PickupInStoreOccModule } from '@spartacus/pickup-in-store/base/occ';

@NgModule({
  imports: [
    PickupInStoreComponentsModule,
    PickupInStoreBaseCoreModule,
    PickupInStoreOccModule,
  ],
})
export class PickupInStoreBaseModule {
  constructor() {
    console.log('~~~~~~~Base Module Loaded');
  }
}
