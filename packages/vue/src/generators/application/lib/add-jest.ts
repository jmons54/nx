import {
  addDependenciesToPackageJson,
  ensurePackage,
  GeneratorCallback,
  runTasksInSerial,
  Tree,
} from '@nx/devkit';
import { nxVersion, vueJest3Version } from '../../../utils/versions';
import { setupJestProject } from '../../../utils/setup-jest';

export async function addJest(
  tree: Tree,
  options: { name: string; projectRoot: string }
): Promise<GeneratorCallback> {
  const tasks: GeneratorCallback[] = [];
  const { configurationGenerator } = ensurePackage<typeof import('@nx/jest')>(
    '@nx/jest',
    nxVersion
  );
  tasks.push(
    await configurationGenerator(tree, {
      project: options.name,
      skipFormat: true,
      testEnvironment: 'jsdom',
      compiler: 'babel',
    })
  );

  setupJestProject(tree, options.projectRoot);

  tasks.push(
    addDependenciesToPackageJson(
      tree,
      {},
      {
        '@vue/vue3-jest': vueJest3Version,
      }
    )
  );

  return runTasksInSerial(...tasks);
}