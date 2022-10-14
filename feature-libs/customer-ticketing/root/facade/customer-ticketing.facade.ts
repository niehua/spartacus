import { Injectable } from '@angular/core';
import { facadeFactory, QueryState } from '@spartacus/core';
import { Observable } from 'rxjs';
import { CUSTOMER_TICKETING_FEATURE } from '../feature-name';
import { TicketDetails, TicketList } from '../model';

@Injectable({
  providedIn: 'root',
  useFactory: () =>
    facadeFactory({
      facade: CustomerTicketingFacade,
      feature: CUSTOMER_TICKETING_FEATURE,
      methods: ['getTicketState', 'getTicket', 'getTicketsState', 'getTickets'],
    }),
})
export abstract class CustomerTicketingFacade {
  abstract getTicketState(): Observable<QueryState<TicketDetails | undefined>>;

  abstract getTicket(): Observable<TicketDetails | undefined>;

  abstract getTicketsState(
    pageSize: number,
    currentPage?: number,
    sort?: string
  ): Observable<QueryState<TicketList | undefined>>;

  abstract getTickets(
    pageSize: number,
    currentPage?: number,
    sort?: string
  ): Observable<TicketList | undefined>;
}
