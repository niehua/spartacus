import { Injectable } from '@angular/core';
import { facadeFactory } from '@spartacus/core';
import { Observable } from 'rxjs';
import { ASM_FEATURE } from '../feature-name';
import {
  AsmUi,
  CustomerSearchOptions,
  CustomerSearchPage,
} from '../model/asm.models';
import { BindCartParams } from '../model/bind-cart.model';

@Injectable({
  providedIn: 'root',
  useFactory: () =>
    facadeFactory({
      facade: AsmFacade,
      feature: ASM_FEATURE,
      methods: [
        'bindCart',
        'customerSearch',
        'customerSearchReset',
        'getCustomerSearchResults',
        'getCustomerSearchResultsLoading',
        'updateAsmUiState',
        'getAsmUiState',
      ],
    }),
})
export abstract class AsmFacade {
  /**
   * Bind an anonymous cart to customer
   * @param options
   */
  abstract bindCart(options: BindCartParams): Observable<unknown>;

  /**
   * Search for customers
   * @param options
   */
  abstract customerSearch(options: CustomerSearchOptions): void;

  /**
   * Reset the customer search result data to the initial state.
   */
  abstract customerSearchReset(): void;

  /**
   * Returns the customer search result data.
   */
  abstract getCustomerSearchResults(): Observable<CustomerSearchPage>;

  /**
   * Returns the customer search result loading status.
   */
  abstract getCustomerSearchResultsLoading(): Observable<boolean>;

  /**
   * Updates the state of the ASM UI
   */
  abstract updateAsmUiState(asmUi: AsmUi): void;

  /**
   * Get the state of the ASM UI
   */
  abstract getAsmUiState(): Observable<AsmUi>;
}
