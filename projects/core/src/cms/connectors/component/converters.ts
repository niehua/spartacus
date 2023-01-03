/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { InjectionToken } from '@angular/core';
import { CmsComponent } from '../../../model/cms.model';
import { Converter } from '../../../util/converter.service';

export const CMS_COMPONENT_NORMALIZER = new InjectionToken<
  Converter<any, CmsComponent>
>('CmsComponentNormalizer');
