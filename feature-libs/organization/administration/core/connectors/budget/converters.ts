/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { InjectionToken } from '@angular/core';
import { Budget } from '../../model/budget.model';
import { Converter, EntitiesModel } from '@spartacus/core';

export const BUDGET_NORMALIZER = new InjectionToken<Converter<any, Budget>>(
  'BudgetNormalizer'
);
export const BUDGETS_NORMALIZER = new InjectionToken<
  Converter<any, EntitiesModel<Budget>>
>('BudgetsListNormalizer');

export const BUDGET_SERIALIZER = new InjectionToken<Converter<Budget, any>>(
  'BudgetSerializer'
);
