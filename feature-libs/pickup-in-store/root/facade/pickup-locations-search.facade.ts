/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import {
  facadeFactory,
  PointOfService,
  PointOfServiceStock,
  Stock,
} from '@spartacus/core';
import { Observable } from 'rxjs';
import { PICKUP_IN_STORE_CORE_FEATURE } from '../feature-name';
import { StockLocationSearchParams } from '../model';

// TODO jsdoc

// TODO split this service

@Injectable({
  providedIn: 'root',
  useFactory: () =>
    facadeFactory({
      facade: PickupLocationsSearchFacade,
      feature: PICKUP_IN_STORE_CORE_FEATURE,
      methods: [
        'startSearch',
        'hasSearchStarted',
        'isSearchRunning',
        'getSearchResults',
        'clearSearchResults',
        'getHideOutOfStock',
        'setBrowserLocation',
        'toggleHideOutOfStock',
        'stockLevelAtStore',
        'getStockLevelAtStore',
        'setPickupOptionToDelivery',
        'setPickupOptionToPickupInStore',
      ],
      async: true,
    }),
})
export abstract class PickupLocationsSearchFacade {
  abstract stockLevelAtStore(productCode: string, storeName: string): void;
  abstract getStockLevelAtStore(
    productCode: string,
    storeName: string
  ): Observable<Stock | undefined>;

  abstract startSearch(searchParams: StockLocationSearchParams): void;
  abstract hasSearchStarted(productCode: string): Observable<boolean>;
  abstract isSearchRunning(): Observable<boolean>;
  abstract getSearchResults(
    productCode: string
  ): Observable<PointOfServiceStock[]>;
  abstract clearSearchResults(): void;
  abstract getHideOutOfStock(): Observable<boolean>;
  abstract setBrowserLocation(latitude: number, longitude: number): void;
  abstract toggleHideOutOfStock(): void;

  abstract getStoreDetails(name: string): Observable<PointOfService>;
  abstract loadStoreDetails(name: string): void;

  abstract setPickupOptionToDelivery(
    cartId: string,
    entryNumber: number,
    userId: string,
    productCode: string,
    quantity: number
  ): void;
  abstract setPickupOptionToPickupInStore(
    cartId: string,
    entryNumber: number,
    userId: string,
    storeName: string,
    quantity: number
  ): void;
}