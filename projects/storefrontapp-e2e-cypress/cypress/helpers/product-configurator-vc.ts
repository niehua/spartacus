/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as configuration from './product-configurator';

const addToCartButtonSelector = 'cx-configurator-add-to-cart-button button';

const conflictDetectedMsgSelector = '.cx-conflict-msg';
const conflictHeaderGroupSelector =
  'cx-configurator-group-menu .cx-menu-conflict';

/**
 * Alias used for updating the config
 */
export const UPDATE_CONFIG_ALIAS = '@updateConfig';

/**
 * Alias used for reading the config
 */
export const GET_CONFIG_ALIAS = '@readConfig';

/**
 * Alias used for reading the config prices
 */
export const CONFIG_PRICING_ALIAS = '@readConfigPricing';

/**
 * Navigates to the product configuration page.
 *
 * @param {string} shopName - shop name
 * @param {string} productId - Product ID
 * @return {Chainable<Window>} - New configuration window
 */
export function goToConfigurationPage(shopName: string, productId: string) {
  //TODO: remove registerConfigurationRoute
  //registerConfigurationRoute();
  const location = `/${shopName}/en/USD/configure/vc/product/entityKey/${productId}`;
  cy.visit(location);
  //cy.wait('@configure_product');
  this.checkConfigPageDisplayed();
}

/**
 * Navigates to the configuration overview  page
 */
export function navigateToOverviewPage() {
  cy.get('.cx-tab-bar').within(() => {
    cy.get('a')
      .filter((index) => index === 1)
      .click()
      .then(() => {
        cy.location('pathname').should(
          'contain',
          '/en/USD/configure-overview/vc/product/entityKey/'
        );
      });
  });
}

/**
 * Register configuration route.
 */
export function registerConfigurationRoute() {
  cy.intercept({
    method: 'GET',
    path: `${Cypress.env('OCC_PREFIX')}/${Cypress.env(
      'BASE_SITE'
    )}/ccpconfigurator/*`,
  }).as(GET_CONFIG_ALIAS.substring(1)); // strip the '@'
}

/**
 * Navigates to the product detail page.
 *
 * @param {string} shopName - shop name
 * @param {string} productId - Product ID
 */
export function goToPDPage(shopName: string, productId: string): void {
  const location = `${shopName}/en/USD/product/${productId}/${productId}`;
  cy.visit(location).then(() => {
    checkLoadingMsgNotDisplayed();
    cy.location('pathname').should('contain', location);
    cy.get('.ProductDetailsPageTemplate').should('be.visible');
  });
}

/**
 * Navigates to the cart page.
 *
 * @param {string} shopName - shop name
 */
export function goToCart(shopName: string) {
  const location = `/${shopName}/en/USD/cart`;
  cy.visit(`/${shopName}/en/USD/cart`).then(() => {
    cy.location('pathname').should('contain', location);
    cy.get('cx-cart-details').should('be.visible');
  });
}

/**
 * Verifies whether the loading message is not displayed.
 */
export function checkLoadingMsgNotDisplayed(): void {
  cy.log('Wait until the loading notification is not displayed anymore');
  cy.get('cx-storefront').should('not.contain.value', 'Loading');
}

/**
 * Verifies whether the global message is not displayed on the top of the configuration.
 */
export function checkGlobalMessageNotDisplayed(): void {
  cy.get('cx-global-message').should('not.be.visible');
}

/**
 * Clicks on 'Add to Cart' button in catalog list.
 */
export function clickOnConfigureBtnInCatalog(productName: string): void {
  cy.get(
    `cx-configure-product a[href*='/configure/vc/product/entityKey/${productName}'`
  )
    .click()
    .then(() => {
      cy.location('pathname').should('contain', '/product/entityKey/');
      this.checkConfigPageDisplayed();
    });
}

/**
 * Verifies whether the ghost animation is not displayed.
 */
export function checkGhostAnimationNotDisplayed(): void {
  cy.log('Wait until the ghost animation is not displayed anymore');
  cy.get('.ghost').should('not.exist');
}

/**
 * Verifies whether the configuration page is displayed.
 */
export function checkConfigPageDisplayed(): void {
  checkGhostAnimationNotDisplayed();
  checkLoadingMsgNotDisplayed();
  checkGlobalMessageNotDisplayed();
  configuration.checkTabBarDisplayed();
  configuration.checkGroupTitleDisplayed();
  configuration.checkGroupFormDisplayed();
  configuration.checkPreviousAndNextBtnsDispalyed();
  configuration.checkPriceSummaryDisplayed();
  //configuration.checkAddToCartBtnDisplayed(); //the add to cart button could be overlayed by the cookies button. The caller has to check that the add to cart button is visible.
  checkProductTitleDisplayed();
  configuration.checkShowMoreLinkAtProductTitleDisplayed();
}

/**
 * Verifies whether the product title component is displayed.
 */
export function checkProductTitleDisplayed(): void {
  configuration.checkUpdatingMessageNotDisplayed();
  cy.get('cx-configurator-product-title', { timeout: 10000 }).should(
    'be.visible'
  );
}

/**
 * Verifies whether status icon is not displayed.
 *
 * @param {string} groupName - Group name
 */
export function checkStatusIconNotDisplayed(groupName: string): void {
  cy.get('button:contains(' + `${groupName}` + ')').should(
    'not.have.class',
    'ERROR'
  );

  cy.get('button:contains(' + `${groupName}` + ')').should(
    'not.have.class',
    'COMPLETE'
  );
}

/**
 * Verifies whether status icon is displayed.
 *
 * @param {string} groupName - Group name
 * @param {string} status - Status
 */
export function checkStatusIconDisplayed(
  groupName: string,
  status: string
): void {
  cy.get('button:contains(' + `${groupName}` + ')').should(
    'have.class',
    `${status}`
  );
}

/**
 * Verifies whether the image value is selected.
 *
 * @param {string} attributeName - Attribute name
 * @param {configuration.uiType} uiType - UI type
 * @param {string} valueName - Value name
 */
export function checkImageSelected(
  uiType: configuration.uiType,
  attributeName: string,
  valueName: string
): void {
  const attributeId = configuration.getAttributeId(attributeName, uiType);
  const valueId = `${attributeId}--${valueName}-input`;
  cy.log('valueId: ' + valueId);
  cy.get(`#${valueId}`).should('have.attr', 'aria-checked', 'true');
}

/**
 * Verifies whether the conflict detected under the attribute name is displayed.
 *
 * @param {string} attributeName - Attribute name
 */
export function checkConflictDetectedMsgDisplayed(attributeName: string): void {
  const parent = cy.get(conflictDetectedMsgSelector).parent();
  const attributeId = configuration.getAttributeLabelId(attributeName);
  parent.children(`#${attributeId}`).should('be.visible');
}

/**
 * Verifies whether the conflict detected under the attribute name is not displayed.
 *
 * @param {string} attributeName - Attribute name
 */
export function checkConflictDetectedMsgNotDisplayed(
  attributeName: string
): void {
  const attributeId = configuration.getAttributeLabelId(attributeName);
  cy.get(`#${attributeId}`).next().should('not.exist');
}

/**
 * Verifies whether the conflict description is displayed.
 *
 * @param {string} description - Conflict description
 */
export function checkConflictDescriptionDisplayed(description: string): void {
  cy.get('cx-configurator-conflict-description').should(($div) => {
    expect($div).to.contain(description);
  });
}

/**
 * Navigates to the corresponding group that contains an attribute which is involved in a conflict.
 *
 * @param attribute - Attribute name
 * @param linkName - link to click
 */
function clickOnConflictSolverLink(attribute: string, linkName: string): void {
  checkGhostAnimationNotDisplayed();
  isConflictLinkAttached(attribute);
  cy.get('cx-configurator-attribute-header').within(() => {
    cy.get(`#cx-configurator--attribute-msg--${attribute}`, {
      timeout: 10000,
    }).within(() => {
      cy.log('Click conflict link ' + linkName);
      cy.get('a.cx-action-link')
        .click()
        .then(() => {
          checkGhostAnimationNotDisplayed();
        });
    });
  });
}

/**
 * Verifies whether the conflict link underneath an attribute is displayed
 *
 * @param attribute - Attribute name
 */
export function isConflictLinkAttached(attribute: string): void {
  cy.get('cx-configurator-attribute-header').within(() => {
    cy.get(`#cx-configurator--attribute-msg--${attribute}`, {
      timeout: 10000,
    }).within(() => {
      cy.get('a.cx-action-link').wait(1000);
    });
  });
}

/**
 * Assuming the given attribute is involved in the conflict, it navigates from the conflict group to standard group
 * containing the corresponding attribute.
 *
 * @param attribute - Attribute name
 */
export function clickOnViewInConfiguration(attribute: string): void {
  cy.log('Click View in Configuration Link');
  clickOnConflictSolverLink(attribute, 'View in Configuration Link');
}

/**
 * Assuming the given attribute is involved in the conflict, it navigates from the conflict group to standard group
 * containing the corresponding attribute and waits for request to finish.
 *
 * @param attribute - Attribute name
 */
export function clickOnViewInConfigurationAndWait(attribute: string): void {
  clickOnViewInConfiguration(attribute);
  cy.wait(GET_CONFIG_ALIAS);
}

/**
 * Assuming the given attribute is involved in the conflict, it navigates from the conflict group to standard group
 * containing the corresponding attribute and waits for request to finish.
 *
 * @param attribute - Attribute name
 */
export function clickOnViewInConfigurationAndWait(attribute: string): void {
  clickOnViewInConfiguration(attribute);
  cy.wait(GET_CONFIG_ALIAS);
}

/**
 * Verifies whether the view in configuration link is displayed.
 */
export function checkViewInConfigurationLinkDisplayed(attribute: string): void {
  cy.log('Verify whether View in Configuration Link is displayed');
  this.checkConflictLink(attribute, 'View in Configuration Link', true);
}

/**
 * Verifies whether the conflict detected - view details link is displayed.
 */
export function checkConflictDetectedLinkDisplayed(attribute: string): void {
  cy.log('Verify whether Conflict Detected - View Details Link is displayed');
  this.checkConflictLink(
    attribute,
    'Conflict Detected - View Details Link',
    true
  );
}

/**
 * Verifies whether the view in configuration link is NOT displayed.
 */
export function checkViewInConfigurationLinkNotDisplayed(
  attribute: string
): void {
  cy.log('Verify whether View in Configuration Link is NOT displayed');
  this.checkConflictLink(attribute, 'View in Configuration Link', false);
}

/**
 * Verifies whether the conflict detected - view details link is NOT displayed.
 */
export function checkConflictDetectedLinkNotDisplayed(attribute: string): void {
  cy.log(
    'Verify whether Conflict Detected - View Details Link is NOT displayed'
  );
  this.checkConflictLink(
    attribute,
    'Conflict Detected - View Details Link',
    false
  );
}

/**
 * Verifies whether the conflict link is displayed.
 */
export function checkConflictLink(
  attribute: string,
  linkName: string,
  isLinkDisplayed: boolean
): void {
  cy.get(
    `cx-configurator-attribute-header #cx-configurator--attribute-msg--${attribute}`
  ).within(() => {
    if (isLinkDisplayed) {
      cy.get('a.cx-action-link').should('be.visible');
      cy.log(linkName + ' is displayed');
    } else {
      cy.get('a.cx-action-link').should('not.to.exist');
      cy.log(linkName + ' is NOT displayed');
    }
  });
}

/**
 * Assuming the given attribute is involved in the conflict, it navigates from the standard group
 * to the conflict group containing the corresponding attribute.
 *
 * @param attribute - Attribute name
 */
export function clickOnConflictDetected(attribute: string): void {
  cy.log('Click Conflict Detected - View Details Link');
  clickOnConflictSolverLink(attribute, 'Conflict Detected - View Details Link');
}

/**
 * Assuming the given attribute is involved in the conflict, it navigates from the standard group
 * to the conflict group containing the corresponding attribute and waits for the request to finish.
 *
 * @param attribute - Attribute name
 */
export function clickOnConflictDetectedAndWait(attribute: string): void {
  clickOnConflictDetected(attribute);
  cy.wait(GET_CONFIG_ALIAS);
}

/**
 * Verifies whether the conflict header group is displayed.
 */
function checkConflictHeaderGroupDisplayed(): void {
  cy.get(conflictHeaderGroupSelector).should('be.visible');
}

/**
 * Verifies whether the conflict header group is not displayed.
 */
function checkConflictHeaderGroupNotDisplayed(): void {
  cy.get(conflictHeaderGroupSelector).should('not.exist');
}

/**
 * Verifies whether the expected number of conflicts is accurate.
 *
 * @param {number} numberOfConflicts - Expected number of conflicts
 */
function verifyNumberOfConflicts(numberOfConflicts: number): void {
  cy.get('cx-configurator-group-menu .conflictNumberIndicator').contains(
    '(' + numberOfConflicts.toString() + ')'
  );
}

/**
 * Selects a conflicting value, namely selects a value.
 * Then verifies whether the conflict detected message under the attribute name is displayed,
 * The conflict header group in the group menu is displayed and
 * Finally verifies whether the expected number of conflicts is accurate.
 *
 * @param {string} attributeName - Attribute name
 * @param {configuration.uiType} uiType - UI type
 * @param {string} valueName - Value name
 * @param {number} numberOfConflicts - Expected number of conflicts
 */
export function selectConflictingValue(
  attributeName: string,
  uiType: configuration.uiType,
  valueName: string,
  numberOfConflicts: number
): void {
  configuration.selectAttribute(attributeName, uiType, valueName);
  this.checkConflictDetectedMsgDisplayed(attributeName);
  checkConflictHeaderGroupDisplayed();
  verifyNumberOfConflicts(numberOfConflicts);
}

/**
 * Selects a conflicting value, namely selects a value and waits for the request to finish.
 * Then verifies whether the conflict detected message under the attribute name is displayed,
 * The conflict header group in the group menu is displayed and
 * Finally verifies whether the expected number of conflicts is accurate.
 *
 * @param {string} attributeName - Attribute name
 * @param {configuration.uiType} uiType - UI type
 * @param {string} valueName - Value name
 * @param {number} numberOfConflicts - Expected number of conflicts
 */
export function selectConflictingValueAndWait(
  attributeName: string,
  uiType: configuration.uiType,
  valueName: string,
  numberOfConflicts: number
): void {
  selectAttributeAndWait(attributeName, uiType, valueName);
  this.checkConflictDetectedMsgDisplayed(attributeName);
  checkConflictHeaderGroupDisplayed();
  verifyNumberOfConflicts(numberOfConflicts);
}

/**
 * Deselects a conflicting value, namely deselects a value.
 * Then verifies whether the conflict detected message under the attribute name is not displayed anymore and
 * the conflict header group in the group menu is not displayed either.
 *
 * @param {string} attributeName - Attribute name
 * @param {configuration.uiType} uiType - UI type
 * @param {string} valueName - Value name
 */
export function deselectConflictingValue(
  attributeName: string,
  uiType: configuration.uiType,
  valueName: string
): void {
  configuration.selectAttribute(attributeName, uiType, valueName);
  this.checkConflictDetectedMsgNotDisplayed(attributeName);
  checkConflictHeaderGroupNotDisplayed();
}

/**
 * Deselects a conflicting value, namely deselects a value and waits for the request to finish.
 * Then verifies whether the conflict detected message under the attribute name is not displayed anymore and
 * the conflict header group in the group menu is not displayed either.
 *
 * @param {string} attributeName - Attribute name
 * @param {configuration.uiType} uiType - UI type
 * @param {string} valueName - Value name
 */
export function deselectConflictingValueAndWait(
  attributeName: string,
  uiType: configuration.uiType,
  valueName: string
): void {
  selectAttributeAndWait(attributeName, uiType, valueName);
  this.checkConflictDetectedMsgNotDisplayed(attributeName);
  checkConflictHeaderGroupNotDisplayed();
}

/**
 * Clicks on the group via its index in the group menu.
 *
 * @param {number} groupIndex - Group index
 */
export function clickOnGroup(groupIndex: number): void {
  cy.get('cx-configurator-group-menu .cx-menu-item')
    .not('.cx-menu-conflict')
    .eq(groupIndex)
    .within(() => {
      cy.get('div.subGroupIndicator').within(($list) => {
        cy.log('$list.children().length: ' + $list.children().length);
        cy.wrap($list.children().length).as('subGroupIndicator');
      });
    });

  cy.get('@subGroupIndicator').then((subGroupIndicator) => {
    cy.log('subGroupIndicator: ' + subGroupIndicator);
    if (!subGroupIndicator) {
      configuration.clickOnGroupByGroupIndex(groupIndex);
    } else {
      configuration.clickOnGroupByGroupIndex(groupIndex);
      configuration.clickOnGroupByGroupIndex(0);
    }
  });
}

/**
 * Clicks on the group via its index in the group menu and wait for the request to finish.
 *
 * @param {number} groupIndex - Group index
 */
export function clickOnGroupAndWait(groupIndex: number): void {
  clickOnGroup(groupIndex);
  cy.wait(GET_CONFIG_ALIAS);
}

/**
 * Scrolls to the bottom of the window and
 * clicks on the 'Add to cart' button.
 */
export function clickAddToCartBtn(): void {
  //Scroll to the bottom of the window
  cy.scrollTo('bottom');

  cy.get(addToCartButtonSelector)
    .click()
    .then(() => {
      cy.location('pathname').should('contain', 'cartEntry/entityKey/');
      checkGlobalMessageNotDisplayed();
    });
}

/**
 * Register configuration update route using name @see UPDATE_CONFIG_ALIAS
 */
export function registerConfigurationUpdateRoute() {
  cy.intercept({
    method: 'PATCH',
    path: `${Cypress.env('OCC_PREFIX')}/${Cypress.env(
      'BASE_SITE'
    )}/ccpconfigurator/*`,
  }).as(UPDATE_CONFIG_ALIAS.substring(1)); // strip the '@'
}

/**
 * Register configuration update route using name @see UPDATE_CONFIG_ALIAS
 */
export function registerConfigurationPricingRoute() {
  cy.intercept({
    method: 'GET',
    path: `${Cypress.env('OCC_PREFIX')}/${Cypress.env(
      'BASE_SITE'
    )}/ccpconfigurator/*/pricing*`,
  }).as(CONFIG_PRICING_ALIAS.substring(1)); // strip the '@'
}

/**
 * Selects a corresponding attribute value and waits for the patch request to complete.
 * Assumes that @see registerConfigurationUpdateRoute was called beforehand.
 *
 * @param {string} attributeName - Attribute name
 * @param {uiType} uiType - UI type
 * @param {string} valueName - Value name
 */
export function selectAttributeAndWait(
  attributeName: string,
  uiType: configuration.uiType,
  valueName: string
): void {
  configuration.selectAttribute(attributeName, uiType, valueName, false);
  cy.wait(UPDATE_CONFIG_ALIAS);
}

/**
 * Clicks on the next group Button and verifies that an element of the next group is displayed.
 *
 * @param {string} nextGroup - optional - expected next group name
 */
export function clickOnNextBtnAndWait(nextGroup?: string): void {
  configuration.clickOnNextBtn(nextGroup);
  cy.wait(GET_CONFIG_ALIAS);
}

/**
 * Clicks on the previous group Button and verifies that an element of the previous group is displayed.
 *
 * @param {string} previousGroup - optional - expected previous group name
 */
export function clickOnPreviousBtnAndWait(previousGroup?: string): void {
  configuration.clickOnPreviousBtn(previousGroup);
  cy.wait(GET_CONFIG_ALIAS);
}

export class CommerceRelease {
  isAtLeast2205?: boolean;
  isAtLeast2211?: boolean;
}

export function checkCommerceRelease(
  shop: string,
  product: string,
  commerceRelease
) {
  cy.request(
    'GET',
    Cypress.env('API_URL') +
      Cypress.env('OCC_PREFIX') +
      '/' +
      shop +
      '/products/' +
      product +
      '/configurators/ccpconfigurator'
  ).then(({ body }) => {
    cy.wrap(body).as('responseBodyVersionCheck');
  });
  cy.get('@responseBodyVersionCheck').then((responseBody) => {
    const responseAsString = JSON.stringify(responseBody);
    commerceRelease.isAtLeast2205 = responseAsString.includes('retractBlocked');
    commerceRelease.isAtLeast2211 = responseAsString.includes(
      'immediateConflictResolution'
    );
    cy.log(
      'Is at least 22.05 commerce release: ' + commerceRelease.isAtLeast2205
    );
    cy.log(
      'Is at least 22.11 commerce release: ' + commerceRelease.isAtLeast2211
    );
  });
}
