/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { NgModule } from '@angular/core';
import { CdcAuthModule } from './auth/cdc-auth.module';
import { facadeProviders } from './auth/facade/facade-providers';
import { CdcEventModule } from './events/cdc-event.module';

@NgModule({
  imports: [CdcAuthModule, CdcEventModule],
  providers: [...facadeProviders],
})
export class CdcCoreModule {}
