// /// <reference types="jest" />

import {
  SchematicTestRunner,
  UnitTestTree,
} from '@angular-devkit/schematics/testing';
import {
  Schema as ApplicationOptions,
  Style,
} from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';
import {
  cartBaseFeatureModulePath,
  LibraryOptions as SpartacusPickupInStoreOptions,
  pickupInStoreFeatureModulePath,
  PICKUP_IN_STORE_FEATURE_NAME,
  SpartacusOptions,
  SPARTACUS_PICKUP_IN_STORE,
  SPARTACUS_SCHEMATICS,
} from '@spartacus/schematics';
import * as path from 'path';
import { peerDependencies } from '../../package.json';

const collectionPath = path.join(__dirname, '../collection.json');
const scssFilePath = 'src/styles/spartacus/pickup-in-store.scss';

describe('Spartacus Pick up In Store schematics: ng-add', () => {
  const schematicRunner = new SchematicTestRunner(
    SPARTACUS_PICKUP_IN_STORE,
    collectionPath
  );

  let appTree: UnitTestTree;

  const workspaceOptions: WorkspaceOptions = {
    name: 'workspace',
    version: '0.5.0',
  };

  const appOptions: ApplicationOptions = {
    name: 'schematics-test',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: Style.Scss,
    skipTests: false,
    projectRoot: '',
  };

  const spartacusDefaultOptions: SpartacusOptions = {
    project: 'schematics-test',
    lazy: true,
    features: [],
  };

  const libraryNoFeaturesOptions: SpartacusPickupInStoreOptions = {
    project: 'schematics-test',
    lazy: true,
    features: [],
  };

  const pickupInStoreFeatureOptions: SpartacusPickupInStoreOptions = {
    ...libraryNoFeaturesOptions,
    features: [PICKUP_IN_STORE_FEATURE_NAME],
  };

  beforeEach(async () => {
    schematicRunner.registerCollection(
      SPARTACUS_SCHEMATICS,
      '../../projects/schematics/src/collection.json'
    );

    appTree = await schematicRunner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'workspace',
        workspaceOptions
      )
      .toPromise();
    appTree = await schematicRunner
      .runExternalSchematicAsync(
        '@schematics/angular',
        'application',
        appOptions,
        appTree
      )
      .toPromise();
    appTree = await schematicRunner
      .runExternalSchematicAsync(
        SPARTACUS_SCHEMATICS,
        'ng-add',
        { ...spartacusDefaultOptions, name: 'schematics-test' },
        appTree
      )
      .toPromise();
  });

  describe('Without features', () => {
    beforeEach(async () => {
      appTree = await schematicRunner
        .runSchematicAsync(
          'ng-add',
          { ...libraryNoFeaturesOptions, features: [] },
          appTree
        )
        .toPromise();
    });

    it('should not create any of the feature modules', () => {
      expect(appTree.exists(pickupInStoreFeatureModulePath)).toBeFalsy();
    });

    it('should install necessary Spartacus libraries', () => {
      const packageJson = JSON.parse(appTree.readContent('package.json'));
      let dependencies: Record<string, string> = {};
      dependencies = { ...packageJson.dependencies };
      dependencies = { ...dependencies, ...packageJson.devDependencies };

      for (const toAdd in peerDependencies) {
        // skip the SPARTACUS_SCHEMATICS, as those are added only when running by the Angular CLI, and not in the testing environment
        if (
          !peerDependencies.hasOwnProperty(toAdd) ||
          toAdd === SPARTACUS_SCHEMATICS
        ) {
          continue;
        }
        // TODO: after 4.0: use this test, as we'll have synced versions between lib's and root package.json
        // const expectedVersion = (peerDependencies as Record<
        //   string,
        //   string
        // >)[toAdd];
        const expectedDependency = dependencies[toAdd];
        expect(expectedDependency).toBeTruthy();
        // expect(expectedDependency).toEqual(expectedVersion);
      }
    });
  });

  describe('Pick Up In Store feature', () => {
    describe('general setup', () => {
      beforeEach(async () => {
        appTree = await schematicRunner
          .runSchematicAsync('ng-add', pickupInStoreFeatureOptions, appTree)
          .toPromise();
      });

      it('should add the feature using the lazy loading syntax', async () => {
        const module = appTree.readContent(pickupInStoreFeatureModulePath);
        expect(module).toMatchSnapshot();
      });

      it('should NOT install the required feature dependencies', async () => {
        const baseCartFeatureModule = appTree.readContent(
          cartBaseFeatureModulePath
        );
        expect(baseCartFeatureModule).toBeFalsy();

        const userFeatureModule = appTree.readContent(
          pickupInStoreFeatureModulePath
        );
        expect(userFeatureModule).toBeFalsy();
      });

      describe('styling', () => {
        it('should create a proper scss file', () => {
          const scssContent = appTree.readContent(scssFilePath);
          expect(scssContent).toMatchSnapshot();
        });

        it('should update angular.json', async () => {
          const content = appTree.readContent('/angular.json');
          expect(content).toMatchSnapshot();
        });
      });
    });

    describe('eager loading', () => {
      beforeEach(async () => {
        appTree = await schematicRunner
          .runSchematicAsync(
            'ng-add',
            { ...pickupInStoreFeatureOptions, lazy: false },
            appTree
          )
          .toPromise();
      });

      it('should import appropriate modules', async () => {
        const module = appTree.readContent(pickupInStoreFeatureModulePath);
        expect(module).toMatchSnapshot();
      });
    });
  });
});
