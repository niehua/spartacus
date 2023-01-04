/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { NgModule } from '@angular/core';
import { OrderComponentsModule } from '@spartacus/order/components';
import { OrderCoreModule } from '@spartacus/order/core';
import { OrderOccModule } from '@spartacus/order/occ';

@NgModule({
  imports: [OrderCoreModule, OrderOccModule, OrderComponentsModule],
})
export class OrderModule {}
