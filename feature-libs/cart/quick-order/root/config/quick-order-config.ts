/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import { Config } from '@spartacus/core';

@Injectable({
  providedIn: 'root',
  useExisting: Config,
})
export abstract class QuickOrderConfig {
  quickOrder?: {
    searchForm?: {
      displayProductImages: boolean;
      maxProducts: number;
      minCharactersBeforeRequest: number;
    };
    list?: {
      hardDeleteTimeout: number;
    };
  };
}

declare module '@spartacus/core' {
  interface Config extends QuickOrderConfig {}
}
