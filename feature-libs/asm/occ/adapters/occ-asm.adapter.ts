import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AsmAdapter,
  AsmConfig,
  CUSTOMER_LISTS_NORMALIZER,
  CUSTOMER_SEARCH_PAGE_NORMALIZER,
} from '@spartacus/asm/core';
import {
  BindCartParams,
  CustomerListsPage,
  CustomerSearchOptions,
  CustomerSearchPage,
} from '@spartacus/asm/root';
import {
  BaseSiteService,
  ConverterService,
  InterceptorUtil,
  OccEndpointsService,
  USE_CUSTOMER_SUPPORT_AGENT_TOKEN,
} from '@spartacus/core';
import { Observable } from 'rxjs';

@Injectable()
export class OccAsmAdapter implements AsmAdapter {
  private activeBaseSite: string;

  constructor(
    protected http: HttpClient,
    protected occEndpointsService: OccEndpointsService,
    protected converterService: ConverterService,
    protected config: AsmConfig,
    protected baseSiteService: BaseSiteService
  ) {
    this.baseSiteService
      .getActive()
      .subscribe((value) => (this.activeBaseSite = value)); // TODO: Concurrency issue?
  }

  customerLists(): Observable<CustomerListsPage> {
    const headers = InterceptorUtil.createHeader(
      USE_CUSTOMER_SUPPORT_AGENT_TOKEN,
      true,
      new HttpHeaders()
    );
    const params: HttpParams = new HttpParams().set(
      'baseSite',
      this.activeBaseSite
    );

    const url = this.occEndpointsService.buildUrl(
      'asmCustomerLists',
      {},
      {
        baseSite: false,
        prefix: false,
      }
    );

    return this.http
      .get<CustomerListsPage>(url, { headers, params })
      .pipe(this.converterService.pipeable(CUSTOMER_LISTS_NORMALIZER));
  }

  customerSearch(
    options: CustomerSearchOptions
  ): Observable<CustomerSearchPage> {
    const headers = InterceptorUtil.createHeader(
      USE_CUSTOMER_SUPPORT_AGENT_TOKEN,
      true,
      new HttpHeaders()
    );
    let params: HttpParams = new HttpParams().set(
      'baseSite',
      this.activeBaseSite
    );

    if (typeof options['sort'] !== 'undefined') {
      params = params.set('sort', '' + options.sort);
    } else {
      params = params.set('sort', 'byNameAsc');
    }

    if (typeof options['query'] !== 'undefined') {
      params = params.set('query', '' + options.query);
    }

    if (typeof options['pageSize'] !== 'undefined') {
      params = params.set('pageSize', '' + options.pageSize);
    }

    if (typeof options['currentPage'] !== 'undefined') {
      params = params.set('currentPage', '' + options.currentPage);
    }

    if (typeof options['customerListId'] !== 'undefined') {
      params = params.set('customerListId', '' + options.customerListId);
    }

    const url = this.occEndpointsService.buildUrl(
      'asmCustomerSearch',
      {},
      {
        baseSite: false,
        prefix: false,
      }
    );

    return this.http
      .get<CustomerSearchPage>(url, { headers, params })
      .pipe(this.converterService.pipeable(CUSTOMER_SEARCH_PAGE_NORMALIZER));
  }

  bindCart({ cartId, customerId }: BindCartParams): Observable<unknown> {
    const headers = InterceptorUtil.createHeader(
      USE_CUSTOMER_SUPPORT_AGENT_TOKEN,
      true,
      new HttpHeaders()
    );
    let params: HttpParams = new HttpParams()
      .set('baseSite', this.activeBaseSite)
      .set('cartId', cartId)
      .set('customerId', customerId);

    const url = this.occEndpointsService.buildUrl(
      'asmBindCart',
      {},
      {
        baseSite: false,
        prefix: false,
      }
    );

    return this.http.post<void>(url, {}, { headers, params });
  }
}
