import {
  addDependenciesToPackageJson,
  formatFiles,
  GeneratorCallback,
  readNxJson,
  removeDependenciesFromPackageJson,
  runTasksInSerial,
  Tree,
  updateNxJson,
} from '@nx/devkit';
import { ReactNativePluginOptions } from '../../../plugins/plugin';
import {
  nxVersion,
  reactDomVersion,
  reactNativeCommunityCli,
  reactNativeCommunityCliAndroid,
  reactNativeCommunityCliIos,
  reactNativeVersion,
  reactVersion,
} from '../../utils/versions';
import { addGitIgnoreEntry } from './lib/add-git-ignore-entry';
import { Schema } from './schema';

export async function reactNativeInitGenerator(host: Tree, schema: Schema) {
  addGitIgnoreEntry(host);

  if (process.env.NX_PCV3 === 'true') {
    addPlugin(host);
  }

  const tasks: GeneratorCallback[] = [];
  if (!schema.skipPackageJson) {
    tasks.push(moveDependency(host));
    tasks.push(updateDependencies(host));
  }

  if (!schema.skipFormat) {
    await formatFiles(host);
  }

  return runTasksInSerial(...tasks);
}

export function updateDependencies(host: Tree) {
  return addDependenciesToPackageJson(
    host,
    {
      react: reactVersion,
      'react-dom': reactDomVersion,
      'react-native': reactNativeVersion,
    },
    {
      '@nx/react-native': nxVersion,
      '@react-native-community/cli': reactNativeCommunityCli,
      '@react-native-community/cli-platform-android':
        reactNativeCommunityCliAndroid,
      '@react-native-community/cli-platform-ios': reactNativeCommunityCliIos,
    }
  );
}

function moveDependency(host: Tree) {
  return removeDependenciesFromPackageJson(host, ['@nx/react-native'], []);
}

function addPlugin(host: Tree) {
  const nxJson = readNxJson(host);
  nxJson.plugins ??= [];

  for (const plugin of nxJson.plugins) {
    if (
      typeof plugin === 'string'
        ? plugin === '@nx/react-native/plugin'
        : plugin.plugin === '@nx/react-native/plugin'
    ) {
      return;
    }
  }

  nxJson.plugins.push({
    plugin: '@nx/react-native/plugin',
    options: {
      startTargetName: 'start',
      podInstallTargetName: 'pod-install',
      bundleTargetName: 'bundle',
      runIosTargetName: 'run-ios',
      runAndroidTargetName: 'run-android',
      buildIosTargetName: 'build-ios',
      buildAndroidTargetName: 'build-android',
    } as ReactNativePluginOptions,
  });
  updateNxJson(host, nxJson);
}

export default reactNativeInitGenerator;
