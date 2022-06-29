import * as addressBook from '../helpers/address-book';
import * as asm from '../helpers/asm';
import * as checkout from '../helpers/checkout-flow';
import { fillShippingAddress } from '../helpers/checkout-forms';
import * as consent from '../helpers/consent-management';
import * as profile from '../helpers/update-profile';
import { getSampleUser } from '../sample-data/checkout-flow';
import {
  interceptDelete,
  interceptGet,
  interceptPost,
} from '../support/utils/intercept';
import { login } from './auth-forms';
import * as loginHelper from './login';
import { navigateToCategory, navigateToHomepage } from './navigation';

export function listenForAuthenticationRequest(): string {
  return interceptPost(
    'csAgentAuthentication',
    '/authorizationserver/oauth/token',
    false
  );
}

export function listenForCustomerSearchRequest(): string {
  return interceptGet(
    'customerLists',
    '/assistedservicewebservices/customers/search?*',
    false
  );
}

export function listenForCustomerListsRequest(): string {
  return interceptGet(
    'customerSearch',
    '/assistedservicewebservices/customerlists?*',
    false
  );
}

export function listenForUserDetailsRequest(): string {
  return interceptGet('userDetails', '/users/*');
}

export function listenForCartBindingRequest(): string {
  return interceptPost(
    'cartBinding',
    '/assistedservicewebservices/bind-cart?*',
    false
  );
}

export function agentLogin(): void {
  const authRequest = listenForAuthenticationRequest();
  cy.get('cx-storefront').within(() => {
    cy.get('cx-csagent-login-form').should('exist');
    cy.get('cx-customer-selection').should('not.exist');
    cy.get('cx-csagent-login-form form').within(() => {
      cy.get('[formcontrolname="userId"]').type('asagent');
      cy.get('[formcontrolname="password"]').type('pw4all');
      cy.get('button[type="submit"]').click();
    });
  });

  cy.wait(authRequest);
  cy.get('cx-csagent-login-form').should('not.exist');
  cy.get('cx-customer-selection').should('exist');
}

export function asmOpenCustomerList(): void {
  cy.get('cx-asm-main-ui div.cx-asm-customer-list a').click();
  cy.get('cx-customer-list').should('exist');
  cy.get('cx-customer-list h2').should('exist');
}

export function asmCustomerLists(): void {
  const customerListsRequestAlias = asm.listenForCustomerListsRequest();
  const customerSearchRequestAlias = asm.listenForCustomerSearchRequest();
  const userDetailsRequestAlias = listenForUserDetailsRequest();

  cy.log('--> Starting customer list');
  asm.asmOpenCustomerList();

  cy.wait(customerListsRequestAlias)
    .its('response.statusCode')
    .should('eq', 200);

  cy.wait(customerSearchRequestAlias)
    .its('response.statusCode')
    .should('eq', 200);

  cy.get('cx-customer-list table').should('exist');

  cy.log('--> checking customer list pagination');
  cy.get('cx-customer-list .cx-btn-previous').should('be.disabled');
  cy.get('cx-customer-list .cx-btn-next').then((button) => {
    cy.wrap(button).click();
    cy.wait(customerSearchRequestAlias)
      .its('response.statusCode')
      .should('eq', 200);
  });
  cy.get('cx-customer-list .cx-btn-previous').should('not.be.disabled');
  cy.get('cx-customer-list .cx-btn-previous').then((button) => {
    cy.wrap(button).click();
    cy.wait(customerSearchRequestAlias)
      .its('response.statusCode')
      .should('eq', 200);
  });

  cy.log('--> checking customer list sorting');
  cy.get('cx-customer-list .sort-selector').then((selects) => {
    let select = selects[0];
    cy.wrap(select)
      .click()
      .get('ng-dropdown-panel')
      .get('.ng-option')
      .eq(1)
      .then((item) => {
        cy.wrap(item).click();
        cy.wait(customerSearchRequestAlias)
          .its('response.statusCode')
          .should('eq', 200);
      });
  });
  cy.log('--> checking customer list group');
  cy.get('cx-customer-list ng-select.customer-list-selector').then(
    (selects) => {
      let select = selects[0];
      cy.wrap(select)
        .click()
        .get('ng-dropdown-panel')
        .get('.ng-option')
        .eq(1)
        .then((item) => {
          cy.wrap(item).click();
          cy.wait(customerSearchRequestAlias)
            .its('response.statusCode')
            .should('eq', 200);
        });
    }
  );

  cy.get('cx-customer-list button.close').click();
  cy.get('cx-customer-list').should('not.exist');

  cy.log('--> start emulation by click name');
  asm.asmOpenCustomerList();

  cy.wait(customerSearchRequestAlias)
    .its('response.statusCode')
    .should('eq', 200);

  cy.get('cx-customer-list')
    .find('.cx-btn-cell')
    .not('[aria-label="Order"]')
    .then(($rows) => {
      expect($rows.length).to.eq(5);
      cy.wrap($rows[0]).click();
      cy.get('cx-customer-list').should('not.exist');
    });
  cy.wait(userDetailsRequestAlias);
  cy.get('cx-customer-emulation input')
    .invoke('attr', 'placeholder')
    .should('not.be.empty');
  cy.get('cx-customer-emulation').should('exist');

  cy.log('--> start emulation by click order');
  asm.asmOpenCustomerList();
  cy.get('cx-customer-list')
    .find('.cx-btn-cell')
    .filter('[aria-label="Order"]')
    .then(($rows) => {
      expect($rows.length).to.eq(5);
      cy.wrap($rows[0]).click();
      cy.get('cx-customer-list').should('not.exist');
      cy.get('cx-order-history').should('exist');
    });
}

export function startCustomerEmulation(customer): void {
  const customerSearchRequestAlias = listenForCustomerSearchRequest();
  const userDetailsRequestAlias = listenForUserDetailsRequest();

  cy.get('cx-csagent-login-form').should('not.exist');
  cy.get('cx-customer-selection').should('exist');
  cy.get('cx-customer-selection form').within(() => {
    cy.get('[formcontrolname="searchTerm"]').type(customer.email);
  });
  cy.wait(customerSearchRequestAlias);

  cy.get('cx-customer-selection div.asm-results button').click();
  cy.get('button[type="submit"]').click();

  cy.wait(userDetailsRequestAlias);
  cy.get('cx-customer-emulation div.customerInfo label.name').should(
    'contain',
    customer.fullName
  );
  cy.get('cx-csagent-login-form').should('not.exist');
  cy.get('cx-customer-selection').should('not.exist');
  cy.get('cx-customer-emulation').should('exist');
}

export function loginCustomerInStorefront(customer) {
  const authRequest = listenForAuthenticationRequest();

  login(customer.email, customer.password);
  cy.wait(authRequest);
}

export function agentSignOut() {
  const tokenRevocationAlias = loginHelper.listenForTokenRevocationRequest();
  cy.get('button[title="Sign Out"]').click();
  cy.wait(tokenRevocationAlias);
  cy.get('cx-csagent-login-form').should('exist');
  cy.get('cx-customer-selection').should('not.exist');
}

export function assertCustomerIsSignedIn() {
  cy.get('cx-login div.cx-login-greet').should('exist');
}

export function deleteFirstAddress() {
  interceptDelete('deleteAddresses', '/users/*/addresses/*?lang=en&curr=USD');
  interceptGet('fetchAddresses', '/users/*/addresses/*?lang=en&curr=USD');

  const firstCard = cy.get('cx-card').first();
  firstCard.contains('Delete').click();
  cy.get('.cx-card-delete button.btn-primary').click();
  cy.wait('@deleteAddress');
  cy.wait('@fetchAddresses');
}

export function testCustomerEmulation() {
  it('should test customer emulation', () => {
    let customer = getSampleUser();
    checkout.registerUser(false, customer);

    // storefront should have ASM UI disabled by default
    checkout.visitHomePage();
    cy.get('cx-asm-main-ui').should('not.exist');

    cy.log('--> Agent logging in');
    checkout.visitHomePage('asm=true');
    cy.get('cx-asm-main-ui').should('exist');
    cy.get('cx-asm-main-ui').should('be.visible');

    asm.agentLogin();

    cy.log('--> Starting customer emulation');
    asm.startCustomerEmulation(customer);

    cy.log('--> Update personal details');
    cy.visit('/my-account/update-profile');
    profile.updateProfile();
    customer.firstName = profile.newFirstName;
    customer.lastName = profile.newLastName;
    customer.fullName = `${profile.newFirstName} ${profile.newLastName}`;
    customer.titleCode = profile.newTitle;

    cy.log('--> Create new address');
    cy.visit('/my-account/address-book');
    cy.get('cx-card').should('have.length', 0);
    fillShippingAddress(addressBook.newAddress);
    cy.get('cx-card').should('have.length', 1);
    addressBook.verifyNewAddress();

    cy.log('--> Add a consent');

    cy.visit('/my-account/consents');
    consent.giveConsent();

    cy.log('--> Stop customer emulation');
    cy.get('cx-customer-emulation button').click();
    cy.get('cx-csagent-login-form').should('not.exist');
    cy.get('cx-customer-selection').should('exist');

    // Without this wait, the test fails b/c the customer search box is disabled
    cy.wait(1000);

    cy.log('--> Start another emulation session');
    asm.startCustomerEmulation(customer);

    cy.log(
      '--> Stop customer emulation using the end session button in the ASM UI'
    );
    cy.get('cx-customer-emulation button').click();
    cy.get('cx-customer-emulation').should('not.exist');
    cy.get('cx-customer-selection').should('exist');

    cy.log('--> sign out and close ASM UI');
    asm.agentSignOut();

    cy.get('button[title="Close ASM"]').click();
    cy.get('cx-asm-main-ui').should('exist');
    cy.get('cx-asm-main-ui').should('not.be.visible');

    // CXSPA-301/GH-14914
    // Must ensure that site is still functional after service agent logout
    navigateToHomepage();
    cy.get('cx-storefront.stop-navigating').should('exist');
    navigateToCategory('Brands', 'brands', false);
    cy.get('cx-product-list-item').should('exist');
  });
}

export function bindCart() {
  const bindingRequest = listenForCartBindingRequest();
  //click button
  cy.get('.bindCartToCustomer').click();
  //make call
  cy.wait(bindingRequest).its('response.statusCode').should('eq', 200);
}
