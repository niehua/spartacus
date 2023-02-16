import { PointOfServiceStock } from '@spartacus/core';
import { PickRequiredDeep } from '../utils/type-utils';

export type PointOfServiceNames = PickRequiredDeep<
  PointOfServiceStock,
  'name' | 'displayName'
>;
