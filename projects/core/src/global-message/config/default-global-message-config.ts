/*
 * SPDX-FileCopyrightText: 2022 SAP Spartacus team <spartacus-team@sap.com>
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { GlobalMessageType } from '../models/global-message.model';
import { GlobalMessageConfig } from './global-message-config';

export const defaultGlobalMessageConfig: GlobalMessageConfig = {
  globalMessages: {
    [GlobalMessageType.MSG_TYPE_CONFIRMATION]: {
      timeout: 3000,
    },
    [GlobalMessageType.MSG_TYPE_INFO]: {
      timeout: 3000,
    },
    [GlobalMessageType.MSG_TYPE_ERROR]: {
      timeout: 7000,
    },
    [GlobalMessageType.MSG_TYPE_WARNING]: {
      timeout: 7000,
    },
    [GlobalMessageType.MSG_TYPE_ASSISTIVE]: {
      timeout: 7000,
    },
  },
};
