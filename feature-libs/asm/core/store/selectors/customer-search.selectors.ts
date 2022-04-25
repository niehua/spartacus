import { createSelector, MemoizedSelector } from '@ngrx/store';
import { StateUtils } from '@spartacus/core';
import { CustomerListsPage, CustomerSearchPage } from '../../models/asm.models';
import { AsmState, StateWithAsm } from '../asm-state';
import { getAsmState } from './feature.selector';

export const getCustomerSearchResultsLoaderState: MemoizedSelector<
  StateWithAsm,
  StateUtils.LoaderState<CustomerSearchPage>
> = createSelector(
  getAsmState,
  (state: AsmState) => state.customerSearchResult
);

export const getCustomerListResultLoaderState: MemoizedSelector<
  StateWithAsm,
  StateUtils.LoaderState<CustomerListsPage>
> = createSelector(getAsmState, (state: AsmState) => state.customerLists);

export const getCustomerListResult: MemoizedSelector<
  StateWithAsm,
  CustomerListsPage
> = createSelector(
  getCustomerListResultLoaderState,
  (state: StateUtils.LoaderState<CustomerListsPage>) =>
    StateUtils.loaderValueSelector(state)
);

export const getCustomerSearchResults: MemoizedSelector<
  StateWithAsm,
  CustomerSearchPage
> = createSelector(
  getCustomerSearchResultsLoaderState,
  (state: StateUtils.LoaderState<CustomerSearchPage>) =>
    StateUtils.loaderValueSelector(state)
);

export const getCustomerSearchResultsLoading: MemoizedSelector<
  StateWithAsm,
  boolean
> = createSelector(
  getCustomerSearchResultsLoaderState,
  (state: StateUtils.LoaderState<CustomerSearchPage>) =>
    StateUtils.loaderLoadingSelector(state)
);
