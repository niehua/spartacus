/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { NgModule } from '@angular/core';
import { CmsConfig, provideDefaultConfigFactory } from '@spartacus/core';
import {} from '@spartacus/pickup-in-store/base/components';
import {  PdpPickupOptionsContainerModule } from '../components/container/index';
import { CartPickupOptionsContainerModule } from './components/index';
import {
  PICKUP_IN_STORE_CORE_FEATURE,
  PICKUP_IN_STORE_FEATURE,
} from './feature-name';

// export function defaultPickupInStoreComponentsConfig(): CmsConfig {
//   return {
//     featureModules: {
//       [PICKUP_IN_STORE_CORE_FEATURE]: PICKUP_IN_STORE_FEATURE,
//     },
//   };
// }

export function defaultPickupInStoreComponentsConfig(): CmsConfig {
  return {
    featureModules: {
      [PICKUP_IN_STORE_FEATURE]: {
        cmsComponents: []
      },
      [PICKUP_IN_STORE_CORE_FEATURE]: PICKUP_IN_STORE_FEATURE,
    },


  };
}


@NgModule({
  imports: [CartPickupOptionsContainerModule, PdpPickupOptionsContainerModule],
  providers: [
    provideDefaultConfigFactory(defaultPickupInStoreComponentsConfig),
  ],
})
export class PickupInStoreBaseRootModule {}
