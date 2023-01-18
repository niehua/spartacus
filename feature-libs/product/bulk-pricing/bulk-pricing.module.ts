/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { NgModule } from '@angular/core';
import { BulkPricingTableModule } from './components/bulk-pricing-table/bulk-pricing-table.module';
import { BulkPricingOccModule } from './occ/bulk-pricing-occ.module';

@NgModule({
  imports: [BulkPricingOccModule, BulkPricingTableModule],
})
export class BulkPricingModule {}
