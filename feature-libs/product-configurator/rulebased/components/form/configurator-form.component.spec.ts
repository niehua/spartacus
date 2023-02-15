import { ChangeDetectionStrategy, Component, Input, Type } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterState } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { I18nTestingModule, RoutingService } from '@spartacus/core';
import {
  CommonConfigurator,
  ConfiguratorModelUtils,
} from '@spartacus/product-configurator/common';
import { cold } from 'jasmine-marbles';
import { EMPTY, Observable, of } from 'rxjs';
import { CommonConfiguratorTestUtilsService } from '../../../common/testing/common-configurator-test-utils.service';
import { ConfiguratorCommonsService } from '../../core/facade/configurator-commons.service';
import { ConfiguratorGroupsService } from '../../core/facade/configurator-groups.service';
import { Configurator } from '../../core/model/configurator.model';
import * as ConfigurationTestData from '../../testing/configurator-test-data';
import { ConfiguratorTestUtils } from '../../testing/configurator-test-utils';
import { ConfiguratorAttributeHeaderComponent } from '../attribute/header/configurator-attribute-header.component';
import { ConfiguratorFormComponent } from './configurator-form.component';
import { productConfiguration } from '../../testing/configurator-test-data';
import { ConfiguratorExpertModeService } from '../../core/services/configurator-expert-mode.service';

@Component({
  selector: 'cx-configurator-group',
  template: '',
})
class MockConfiguratorDefaultFormComponent {
  @Input() group: Configurator.Group;
  @Input() owner: CommonConfigurator.Owner;
  @Input() isNavigationToGroupEnabled = true;
}

const PRODUCT_CODE = 'CONF_LAPTOP';
const CONFIGURATOR_ROUTE = 'configureCPQCONFIGURATOR';
const CONFIG_ID_TEMPLATE = 'abcd';

const mockRouterState: any = {
  state: {
    params: {
      entityKey: PRODUCT_CODE,
      ownerType: CommonConfigurator.OwnerType.PRODUCT,
    },
    semanticRoute: CONFIGURATOR_ROUTE,
    queryParams: {},
  },
};

const MOCK_ROUTER_STATE_WITH_TEMPLATE: any = {
  state: {
    ...mockRouterState.state,
    queryParams: { configIdTemplate: CONFIG_ID_TEMPLATE },
  },
};

const OWNER = ConfiguratorModelUtils.createOwner(
  CommonConfigurator.OwnerType.PRODUCT,
  PRODUCT_CODE
);

const groups = ConfigurationTestData.productConfiguration.groups;

const configRead: Configurator.Configuration = {
  ...ConfiguratorTestUtils.createConfiguration('a', OWNER),
  consistent: true,
  complete: true,
  productCode: PRODUCT_CODE,
  groups: groups,
};

const configRead2: Configurator.Configuration = {
  ...ConfiguratorTestUtils.createConfiguration('b', OWNER),
  consistent: true,
  complete: true,
  productCode: PRODUCT_CODE,
  groups: groups,
};

let routerStateObservable: Observable<RouterState> = EMPTY;
let configurationCreateObservable: Observable<Configurator.Configuration> =
  EMPTY;
let currentGroupObservable: Observable<string> = EMPTY;
let isConfigurationLoadingObservable: Observable<boolean> = EMPTY;

class MockRoutingService {
  getRouterState(): Observable<RouterState> {
    return routerStateObservable;
  }
}

class MockConfiguratorCommonsService {
  getOrCreateConfiguration(): Observable<Configurator.Configuration> {
    return configurationCreateObservable;
  }

  getConfiguration(): Observable<Configurator.Configuration> {
    return configurationCreateObservable;
  }

  removeConfiguration(): void {}

  updateConfiguration(): void {}

  isConfigurationLoading(): Observable<boolean> {
    return isConfigurationLoadingObservable;
  }

  hasConflicts(): Observable<boolean> {
    return hasConfigurationConflictsObservable;
  }
  checkConflictSolverDialog(): void {}
}

class MockConfiguratorGroupsService {
  getCurrentGroup(): Observable<string> {
    return currentGroupObservable;
  }

  getNextGroup(): Observable<string> {
    return of('');
  }

  getPreviousGroup(): Observable<string> {
    return of('');
  }

  isGroupVisited(): Observable<boolean> {
    return of(true);
  }

  subscribeToUpdateConfiguration() {}

  setGroupStatusVisited(): void {}

  navigateToConflictSolver(): void {}

  navigateToFirstAttributeGroup(): void {}

  navigateToFirstIncompleteGroup(): void {}

  isConflictGroupType() {}
}

class MockConfiguratorExpertModeService {
  setExpModeRequested(): void {}

  getExpModeRequested() {}

  setExpModeActive(): void {}

  getExpModeActive() {}
}

function checkConfigurationObs(
  routerMarbels: string,
  configurationServiceMarbels: string,
  expectedMarbels: string
) {
  routerStateObservable = cold(routerMarbels, {
    a: mockRouterState,
    b: MOCK_ROUTER_STATE_WITH_TEMPLATE,
  });
  configurationCreateObservable = cold(configurationServiceMarbels, {
    x: configRead,
    y: configRead2,
  });

  const fixture = TestBed.createComponent(ConfiguratorFormComponent);
  const component = fixture.componentInstance;
  expect(component.configuration$).toBeObservable(
    cold(expectedMarbels, { x: configRead, y: configRead2 })
  );
}

function checkCurrentGroupObs(
  routerMarbels: string,
  groupMarbels: string,
  expectedMarbels: string
) {
  routerStateObservable = cold(routerMarbels, {
    a: mockRouterState,
  });
  currentGroupObservable = cold(groupMarbels, {
    u: groups[0],
    v: groups[1],
  });
  const fixture = TestBed.createComponent(ConfiguratorFormComponent);
  const component = fixture.componentInstance;
  expect(component.currentGroup$).toBeObservable(
    cold(expectedMarbels, {
      u: groups[0],
      v: groups[1],
    })
  );
}

function createComponentWithoutData(): ConfiguratorFormComponent {
  fixture = TestBed.createComponent(ConfiguratorFormComponent);
  component = fixture.componentInstance;
  htmlElem = fixture.nativeElement;
  fixture.detectChanges();
  return component;
}

const configuration: Configurator.Configuration =
  structuredClone(productConfiguration);

const group: Configurator.Group = structuredClone(
  productConfiguration.groups[0]
);

function createComponentWithData(): ConfiguratorFormComponent {
  fixture = TestBed.createComponent(ConfiguratorFormComponent);
  component = fixture.componentInstance;
  htmlElem = fixture.nativeElement;
  component.currentGroup$ = of(group);
  component.configuration$ = of(configuration);
  fixture.detectChanges();
  return component;
}

let configuratorCommonsService: ConfiguratorCommonsService;
let configuratorGroupsService: ConfiguratorGroupsService;
let fixture: ComponentFixture<ConfiguratorFormComponent>;
let component: ConfiguratorFormComponent;
let htmlElem: HTMLElement;
let configExpertModeService: ConfiguratorExpertModeService;
let hasConfigurationConflictsObservable: Observable<boolean> = EMPTY;

describe('ConfigurationFormComponent', () => {
  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [I18nTestingModule, ReactiveFormsModule, NgSelectModule],
        declarations: [
          MockConfiguratorDefaultFormComponent,
          ConfiguratorFormComponent,
        ],
        providers: [
          {
            provide: RoutingService,
            useClass: MockRoutingService,
          },

          {
            provide: ConfiguratorCommonsService,
            useClass: MockConfiguratorCommonsService,
          },
          {
            provide: ConfiguratorGroupsService,
            useClass: MockConfiguratorGroupsService,
          },
          {
            provide: ConfiguratorExpertModeService,
            useClass: MockConfiguratorExpertModeService,
          },
        ],
      })
        .overrideComponent(ConfiguratorAttributeHeaderComponent, {
          set: {
            changeDetection: ChangeDetectionStrategy.Default,
          },
        })
        .compileComponents();
    })
  );

  beforeEach(() => {
    configuratorGroupsService = TestBed.inject(
      ConfiguratorGroupsService as Type<ConfiguratorGroupsService>
    );

    spyOn(configuratorGroupsService, 'setGroupStatusVisited').and.callThrough();

    configuratorCommonsService = TestBed.inject(
      ConfiguratorCommonsService as Type<ConfiguratorCommonsService>
    );
    spyOn(
      configuratorCommonsService,
      'isConfigurationLoading'
    ).and.callThrough();

    isConfigurationLoadingObservable = of(false);

    configExpertModeService = TestBed.inject(
      ConfiguratorExpertModeService as Type<ConfiguratorExpertModeService>
    );
    spyOn(configExpertModeService, 'setExpModeRequested').and.callThrough();

    hasConfigurationConflictsObservable = of(false);
  });

  describe('resolve issues navigation', () => {
    it('should go to neither conflict solver nor first incomplete group', () => {
      spyOn(
        configuratorGroupsService,
        'navigateToConflictSolver'
      ).and.callThrough();
      spyOn(
        configuratorGroupsService,
        'navigateToFirstIncompleteGroup'
      ).and.callThrough();
      routerStateObservable = of({
        ...mockRouterState,
      });

      createComponentWithData().ngOnInit();

      expect(
        configuratorGroupsService.navigateToConflictSolver
      ).toHaveBeenCalledTimes(0);
      expect(
        configuratorGroupsService.navigateToFirstIncompleteGroup
      ).toHaveBeenCalledTimes(0);
    });

    it('should go to conflict solver in case the router requires this - has conflicts', () => {
      spyOn(
        configuratorGroupsService,
        'navigateToConflictSolver'
      ).and.callThrough();

      spyOn(
        configuratorGroupsService,
        'navigateToFirstIncompleteGroup'
      ).and.callThrough();

      routerStateObservable = of({
        ...mockRouterState,
        state: {
          ...mockRouterState.state,
          queryParams: { resolveIssues: 'true' },
        },
      });

      hasConfigurationConflictsObservable = of(true);
      createComponentWithData();

      expect(
        configuratorGroupsService.navigateToConflictSolver
      ).toHaveBeenCalledTimes(1);
      expect(
        configuratorGroupsService.navigateToFirstIncompleteGroup
      ).toHaveBeenCalledTimes(0);
    });

    it('should go to first incomplete group in case the router requires this - has conflicts, but should be skipped', () => {
      spyOn(
        configuratorGroupsService,
        'navigateToConflictSolver'
      ).and.callThrough();
      spyOn(
        configuratorGroupsService,
        'navigateToFirstIncompleteGroup'
      ).and.callThrough();
      routerStateObservable = of({
        ...mockRouterState,
        state: {
          ...mockRouterState.state,
          queryParams: { resolveIssues: 'true', skipConflicts: 'true' },
        },
      });
      hasConfigurationConflictsObservable = of(true);
      createComponentWithData();
      expect(
        configuratorGroupsService.navigateToConflictSolver
      ).toHaveBeenCalledTimes(0);
      expect(
        configuratorGroupsService.navigateToFirstIncompleteGroup
      ).toHaveBeenCalledTimes(1);
    });

    it('should go to first incomplete group in case the router requires this - has no conflicts', () => {
      spyOn(
        configuratorGroupsService,
        'navigateToConflictSolver'
      ).and.callThrough();
      spyOn(
        configuratorGroupsService,
        'navigateToFirstIncompleteGroup'
      ).and.callThrough();
      routerStateObservable = of({
        ...mockRouterState,
        state: {
          ...mockRouterState.state,
          queryParams: { resolveIssues: 'true' },
        },
      });
      createComponentWithData();

      expect(
        configuratorGroupsService.navigateToConflictSolver
      ).toHaveBeenCalledTimes(0);
      expect(
        configuratorGroupsService.navigateToFirstIncompleteGroup
      ).toHaveBeenCalledTimes(1);
    });

    it('should not call setExpMode method', () => {
      routerStateObservable = of({
        ...mockRouterState,
        state: {
          ...mockRouterState.state,
          queryParams: { expMode: 'false' },
        },
      });
      createComponentWithData().ngOnInit();
      expect(configExpertModeService.setExpModeRequested).toHaveBeenCalledTimes(
        0
      );
    });
  });

  describe('Rendering', () => {
    it('should render ghost view if no data is present', () => {
      createComponentWithoutData();

      CommonConfiguratorTestUtilsService.expectNumberOfElements(
        expect,
        htmlElem,
        '.cx-ghost-attribute',
        6
      );
      CommonConfiguratorTestUtilsService.expectElementNotPresent(
        expect,
        htmlElem,
        'cx-configurator-group'
      );
    });

    it('should render configuration form', () => {
      createComponentWithData();

      CommonConfiguratorTestUtilsService.expectElementPresent(
        expect,
        htmlElem,
        'cx-configurator-group'
      );
      CommonConfiguratorTestUtilsService.expectElementNotPresent(
        expect,
        htmlElem,
        '.cx-ghost-attribute'
      );
    });
  });

  describe('configuration$ observable', () => {
    it('should emit twice if router emits faster than commons service', () => {
      checkConfigurationObs('aa', '---xy', '----xy');
    });

    it('should emit 3 times if both services emit fast', () => {
      checkConfigurationObs('aa', 'xy', 'xxy');
    });

    it('should emit 4 times if router pauses between emissions', () => {
      checkConfigurationObs('a---a', 'xy', 'xy--xy');
    });

    it('should forward configuration template ID to facade service', () => {
      spyOn(
        configuratorCommonsService,
        'getOrCreateConfiguration'
      ).and.callThrough();
      checkConfigurationObs('b', 'x', 'x');
      expect(
        configuratorCommonsService.getOrCreateConfiguration
      ).toHaveBeenCalledWith(OWNER, CONFIG_ID_TEMPLATE);
    });
  });

  describe('currentGroup$ observable', () => {
    it('should only get the minimum needed 2 emissions of current groups if group service emits slowly', () => {
      checkCurrentGroupObs('aa', '---uv', '----uv');
    });

    it('should get 4 emissions of current groups if configurations service emits fast', () => {
      checkCurrentGroupObs('a---a', '--uv', '--uv--uv');
    });

    it('should get the maximum 8 emissions of current groups if router and config service emit slowly', () => {
      checkCurrentGroupObs('a-----a', 'uv', 'uv----uv');
    });
  });

  describe('isNavigationToGroupEnabled()', () => {
    it('should return true in case immediateConflictResolution is set to false', () => {
      expect(component.isNavigationToGroupEnabled(configuration)).toBe(true);
    });

    it('should return false in case immediateConflictResolution is set to true', () => {
      configuration.immediateConflictResolution = true;
      expect(component.isNavigationToGroupEnabled(configuration)).toBe(false);
    });
  });

  describe('ngOnInit()', () => {
    it('should call getConfiguration in order to prepare conflict check', () => {
      routerStateObservable = of({
        ...mockRouterState,
      });
      spyOn(configuratorCommonsService, 'getConfiguration').and.callThrough();
      createComponentWithData();
      expect(configuratorCommonsService.getConfiguration).toHaveBeenCalledTimes(
        1
      );
    });

    it('should call checkConflictSolverDialog on facade in order to launch conflict check', () => {
      routerStateObservable = of({
        ...mockRouterState,
      });
      configurationCreateObservable = of(configRead);
      spyOn(
        configuratorCommonsService,
        'checkConflictSolverDialog'
      ).and.callThrough();
      createComponentWithData();
      expect(
        configuratorCommonsService.checkConflictSolverDialog
      ).toHaveBeenCalledTimes(1);
    });
  });
});
