import type { GeneratorCallback, Tree } from '@nx/devkit';
import { formatFiles, runTasksInSerial } from '@nx/devkit';
import { applicationGenerator as nodeApplicationGenerator } from '@nx/node';

import { initGenerator } from '../init/init';
import {
  createFiles,
  ensureDependencies,
  normalizeOptions,
  toNodeApplicationGeneratorOptions,
  updateTsConfig,
} from './lib';
import type { ApplicationGeneratorOptions } from './schema';

export async function applicationGenerator(
  tree: Tree,
  rawOptions: ApplicationGeneratorOptions
): Promise<GeneratorCallback> {
  return await applicationGeneratorInternal(tree, {
    projectNameAndRootFormat: 'derived',
    ...rawOptions,
  });
}

export async function applicationGeneratorInternal(
  tree: Tree,
  rawOptions: ApplicationGeneratorOptions
): Promise<GeneratorCallback> {
  const options = await normalizeOptions(tree, rawOptions);

  const tasks: GeneratorCallback[] = [];
  const initTask = await initGenerator(tree, {
    skipPackageJson: options.skipPackageJson,
    skipFormat: true,
  });
  tasks.push(initTask);
  const nodeApplicationTask = await nodeApplicationGenerator(
    tree,
    toNodeApplicationGeneratorOptions(options)
  );
  tasks.push(nodeApplicationTask);
  createFiles(tree, options);
  updateTsConfig(tree, options);

  if (!options.skipPackageJson) {
    tasks.push(ensureDependencies(tree));
  }

  if (!options.skipFormat) {
    await formatFiles(tree);
  }

  return runTasksInSerial(...tasks);
}

export default applicationGenerator;
