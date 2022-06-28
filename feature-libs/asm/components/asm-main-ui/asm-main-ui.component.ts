import { Component, HostBinding, OnInit } from '@angular/core';
import {
  AsmFacade,
  AsmUi,
  CsAgentAuthService,
  CustomerListColumnActionType,
} from '@spartacus/asm/root';
import {
  AuthService,
  GlobalMessageService,
  GlobalMessageType,
  RoutingService,
  User,
} from '@spartacus/core';
import { ICON_TYPE, ModalRef, ModalService } from '@spartacus/storefront';
import { UserAccountFacade } from '@spartacus/user/account/root';
import { Observable, of } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import { CustomerListComponent } from '../customer-list/customer-list.component';
import { CustomerListActionEvent } from '../customer-list/customer-list.model';
import { AsmComponentService } from '../services/asm-component.service';
@Component({
  selector: 'cx-asm-main-ui',
  templateUrl: './asm-main-ui.component.html',
})
export class AsmMainUiComponent implements OnInit {
  customerSupportAgentLoggedIn$: Observable<boolean>;
  csAgentTokenLoading$: Observable<boolean>;
  customer$: Observable<User | undefined>;
  isCollapsed$: Observable<boolean>;
  iconTypes = ICON_TYPE;

  @HostBinding('class.hidden') disabled = false;

  protected startingCustomerSession = false;

  protected modalRef: ModalRef | null;

  constructor(
    protected authService: AuthService,
    protected csAgentAuthService: CsAgentAuthService,
    protected asmComponentService: AsmComponentService,
    protected globalMessageService: GlobalMessageService,
    protected routingService: RoutingService,
    protected asmFacade: AsmFacade,
    protected modalService: ModalService,
    protected userAccountFacade: UserAccountFacade
  ) {}

  ngOnInit(): void {
    this.customerSupportAgentLoggedIn$ = this.csAgentAuthService
      .isCustomerSupportAgentLoggedIn()
      .pipe(
        distinctUntilChanged(),
        tap((loggedIn) => {
          if (!loggedIn) {
            this.closeModal();
          }
        })
      );

    this.csAgentTokenLoading$ =
      this.csAgentAuthService.getCustomerSupportAgentTokenLoading();
    this.customer$ = this.authService.isUserLoggedIn().pipe(
      switchMap((isLoggedIn) => {
        if (isLoggedIn) {
          this.handleCustomerSessionStartRedirection();
          return this.userAccountFacade.get();
        } else {
          return of(undefined);
        }
      })
    );
    this.isCollapsed$ = this.asmFacade
      .getAsmUiState()
      .pipe(
        map((uiState: AsmUi) =>
          uiState.collapsed === undefined ? false : uiState.collapsed
        )
      );
  }

  protected handleCustomerSessionStartRedirection(): void {
    this.asmComponentService
      .isCustomerEmulationSessionInProgress()
      .pipe(take(1))
      .subscribe((isCustomerEmulated) => {
        if (this.startingCustomerSession && isCustomerEmulated) {
          this.startingCustomerSession = false;
          this.globalMessageService.remove(GlobalMessageType.MSG_TYPE_ERROR);
          this.routingService.go('/');
        }
      });
  }

  loginCustomerSupportAgent({
    userId,
    password,
  }: {
    userId: string;
    password: string;
  }): void {
    this.csAgentAuthService.authorizeCustomerSupportAgent(userId, password);
  }

  logout(): void {
    this.asmComponentService.logoutCustomerSupportAgentAndCustomer();
  }

  startCustomerEmulationSession({ customerId }: { customerId?: string }): void {
    if (customerId) {
      this.csAgentAuthService.startCustomerEmulationSession(customerId);
      this.startingCustomerSession = true;
    } else {
      this.globalMessageService.add(
        { key: 'asm.error.noCustomerId' },
        GlobalMessageType.MSG_TYPE_ERROR
      );
    }
  }

  hideUi(): void {
    this.disabled = true;
    this.asmComponentService.unload();
  }

  showCustomList(): void {
    this.modalRef = this.modalService.open(CustomerListComponent, {
      centered: true,
      size: 'mf',
      windowClass: 'fiori-like',
      ariaLabelledBy: 'asm-customer-list-title',
      ariaDescribedBy: 'asm-customer-list-desc',
    });
    this.modalRef.result
      .then(({ selectedUser, actionType }: CustomerListActionEvent) => {
        if (selectedUser) {
          this.startCustomerEmulationSession(selectedUser);
          if (actionType === CustomerListColumnActionType.ORDER_HISTORY) {
            this.routingService.go({ cxRoute: 'orders' });
          }
        }
        this.modalRef = null;
      })
      .catch(() => {
        // this  callback is called when modal is closed with Esc key or clicking backdrop
        this.modalRef = null;
      });
  }

  closeModal(): void {
    if (this.modalService.getActiveModal() === this.modalRef) {
      this.modalService.closeActiveModal();
    }
  }
}
