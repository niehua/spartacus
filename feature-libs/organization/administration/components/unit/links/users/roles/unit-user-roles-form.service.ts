/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { B2BUser, B2BUserRole } from '@spartacus/core';
import { B2BUserService } from '@spartacus/organization/administration/core';
import { FormService } from '../../../../shared/form/form.service';

@Injectable({
  providedIn: 'root',
})
export class UnitUserRolesFormService extends FormService<B2BUser> {
  availableRoles: B2BUserRole[] = this.userService.getAllRoles();

  constructor(protected userService: B2BUserService) {
    super();
  }

  getForm(item?: B2BUser): UntypedFormGroup | null {
    // if form already exist, while switching between users
    // it didn't patchData again, so used force rebuild
    this.form = null;
    return super.getForm(item);
  }

  protected build() {
    const form = new UntypedFormGroup({});
    this.availableRoles.forEach((role) =>
      form.addControl(role, new UntypedFormControl())
    );
    this.form = form;
  }

  protected patchData(item: B2BUser) {
    super.patchData(item);
    if (item) {
      item.roles?.forEach((role) => {
        this.form?.get(role)?.setValue(true);
      });
    }
  }
}
