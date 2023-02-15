/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { FeaturesConfigModule, I18nModule } from '@spartacus/core';
import { NgSelectA11yModule } from '../../../../shared/components/ng-select-a11y';
import { FormErrorsModule } from '../../../../shared/index';
import { KeyboardFocusModule } from '../../../../layout/a11y/keyboard-focus/index';
import { IconModule } from '../../../misc/icon/index';
import { AddressFormComponent } from './address-form.component';
import { SuggestedAddressDialogComponent } from './suggested-addresses-dialog/suggested-addresses-dialog.component';

@NgModule({
  /**
   * TODO: (#CXSPA-53) Remove FeaturesConfigModule in 6.0
   */
  imports: [
    NgSelectA11yModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    NgSelectModule,
    IconModule,
    I18nModule,
    FormErrorsModule,
    KeyboardFocusModule,
    FeaturesConfigModule,
  ],
  declarations: [AddressFormComponent, SuggestedAddressDialogComponent],
  exports: [AddressFormComponent, SuggestedAddressDialogComponent],
})
export class AddressFormModule {}
