/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { TranslationChunksConfig, TranslationResources } from '@spartacus/core';
import { en } from './en/index';

export const quickOrderTranslations: TranslationResources = {
  en,
};

// expose all translation chunk mapping for quickOrder feature
export const quickOrderTranslationChunksConfig: TranslationChunksConfig = {
  quickOrder: [
    'quickOrderCartForm',
    'quickOrderForm',
    'quickOrderList',
    'quickOrderTable',
  ],
};
