/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import {
  CmsService,
  Page,
  PointOfService,
  RoutingService,
} from '@spartacus/core';
import { PointOfServiceNames } from '@spartacus/pickup-in-store/base/core';
import {
  PickupLocationsSearchFacade,
  PreferredStoreFacade,
} from '@spartacus/pickup-in-store/base/root';
import { StoreFinderService } from '@spartacus/storefinder/core';
import { ICON_TYPE } from '@spartacus/storefront';
import { Observable } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';

@Component({
  selector: 'cx-my-preferred-store',
  templateUrl: 'my-preferred-store.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyPreferredStoreComponent implements OnInit {
  preferredStore$: Observable<PointOfService>;
  content = {
    header: 'My Store',
    actions: [
      { event: 'send', name: 'Get Directions' },
      { event: 'edit', name: 'Change Store' },
    ],
  };
  openHoursOpen = false;
  readonly ICON_TYPE = ICON_TYPE;
  pointOfService: PointOfService;
  isStoreFinder = false;

  constructor(
    private preferredStoreService: PreferredStoreFacade,
    protected pickupLocationsSearchService: PickupLocationsSearchFacade,
    protected routingService: RoutingService,
    protected storeFinderService: StoreFinderService,
    protected cmsService: CmsService
  ) {
    this.preferredStore$ = this.preferredStoreService.getPreferredStore$().pipe(
      filter((preferredStore) => preferredStore !== null),
      map((preferredStore) => preferredStore as PointOfServiceNames),
      filter((preferredStore) => !!preferredStore.name),
      map((preferredStore) => preferredStore.name),
      tap((preferredStoreName) =>
        this.pickupLocationsSearchService.loadStoreDetails(
          preferredStoreName as string
        )
      ),
      switchMap((preferredStoreName) =>
        this.pickupLocationsSearchService.getStoreDetails(
          preferredStoreName as string
        )
      ),
      tap((store: PointOfService) => {
        this.pointOfService = store;
      })
    );
  }

  ngOnInit(): void {
    this.cmsService
      .getCurrentPage()
      .pipe(
        filter<Page>(Boolean),
        take(1),
        tap(
          (cmsPage) =>
            (this.isStoreFinder = cmsPage.pageId === 'storefinderPage')
        ),
        filter(() => this.isStoreFinder),
        tap(() => {
          this.content = {
            header: '',
            actions: [{ event: 'send', name: 'Get Directions' }],
          };
        })
      )
      .subscribe();
  }

  /**
   * Toggle whether the store's opening hours are visible.
   */
  toggleOpenHours(): boolean {
    this.openHoursOpen = !this.openHoursOpen;
    return false;
  }

  changeStore(): void {
    this.routingService.go(['/store-finder']);
  }

  getDirectionsToStore(): void {
    const linkToDirections: string = this.storeFinderService.getDirections(
      this.pointOfService
    );
    window.open(linkToDirections, '_blank');
  }
}
