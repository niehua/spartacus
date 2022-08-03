import * as login from '../../../helpers/login';
import { viewportContext } from '../../../helpers/viewport-context';

describe('Login', () => {
  viewportContext(['desktop'], () => {
    before(() => {
      cy.visit('/login');
      login.registerUserFromLoginPage();
    });

    it('should login and logout successfully', () => {
      login.loginUser();

      const tokenRevocationRequestAlias =
        login.listenForTokenRevocationRequest();
      login.signOutUser();
      cy.wait(tokenRevocationRequestAlias);
    });

    it('should not login with wrong password', () => {
      cy.visit('/login');
      login.loginWithBadCredentialsFromLoginPage();
    });
  });
});
