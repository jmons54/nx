import {
  addDependenciesToPackageJson,
  formatFiles,
  GeneratorCallback,
  installPackagesTask,
  readNxJson,
  runTasksInSerial,
  Tree,
  updateJson,
  updateNxJson,
} from '@nx/devkit';
import { gte } from 'semver';
import {
  addPlugin,
  getInstalledStorybookVersion,
  storybookMajorVersion,
} from '../../utils/utilities';
import { nxVersion, storybookVersion } from '../../utils/versions';
import { Schema } from './schema';

function checkDependenciesInstalled(host: Tree): GeneratorCallback {
  const devDependencies: Record<string, string> = {
    '@nx/storybook': nxVersion,
  };

  if (process.env.NX_PCV3 === 'true') {
    let storybook7VersionToInstall = storybookVersion;
    if (
      storybookMajorVersion() >= 7 &&
      getInstalledStorybookVersion() &&
      gte(getInstalledStorybookVersion(), '7.0.0')
    ) {
      storybook7VersionToInstall = getInstalledStorybookVersion();
    }

    devDependencies['storybook'] = storybook7VersionToInstall;
  }

  return addDependenciesToPackageJson(host, {}, devDependencies);
}

function addCacheableOperation(tree: Tree) {
  const nxJson = readNxJson(tree);
  const cacheableOperations: string[] | null =
    nxJson.tasksRunnerOptions?.default?.options?.cacheableOperations;

  if (cacheableOperations && cacheableOperations.includes('build-storybook')) {
    nxJson.tasksRunnerOptions.default.options.cacheableOperations.push(
      'build-storybook'
    );
  }

  nxJson.targetDefaults ??= {};
  nxJson.targetDefaults['build-storybook'] ??= {};
  nxJson.targetDefaults['build-storybook'].cache = true;

  updateNxJson(tree, nxJson);
}

function moveToDevDependencies(tree: Tree): GeneratorCallback {
  let updated = false;

  updateJson(tree, 'package.json', (packageJson) => {
    packageJson.dependencies = packageJson.dependencies || {};
    packageJson.devDependencies = packageJson.devDependencies || {};

    if (packageJson.dependencies['@nx/storybook']) {
      packageJson.devDependencies['@nx/storybook'] =
        packageJson.dependencies['@nx/storybook'];
      delete packageJson.dependencies['@nx/storybook'];
      updated = true;
    }

    return packageJson;
  });

  return updated ? () => installPackagesTask(tree) : () => {};
}

export async function initGenerator(tree: Tree, schema: Schema) {
  addCacheableOperation(tree);

  if (process.env.NX_PCV3 === 'true') {
    addPlugin(tree);
  }

  const tasks: GeneratorCallback[] = [];
  if (!schema.skipPackageJson) {
    tasks.push(moveToDevDependencies(tree));
    tasks.push(checkDependenciesInstalled(tree));
  }

  if (!schema.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
}

export default initGenerator;
