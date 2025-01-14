import { CreateNodesContext } from '@nx/devkit';
import { createNodes } from './plugin';

jest.mock('vite', () => ({
  loadConfigFromFile: jest.fn().mockImplementation(() => {
    return Promise.resolve({
      path: 'vite.config.ts',
      config: {
        test: {
          some: 'option',
        },
      },
      dependencies: [],
    });
  }),
}));

jest.mock('../utils/executor-utils', () => ({
  loadViteDynamicImport: jest.fn().mockResolvedValue({
    loadConfigFromFile: jest.fn().mockResolvedValue({
      path: 'vite.config.ts',
      config: {
        test: {
          some: 'option',
        },
      },
      dependencies: [],
    }),
  }),
}));

describe('@nx/vite/plugin with test node', () => {
  let createNodesFunction = createNodes[1];
  let context: CreateNodesContext;
  describe('root project', () => {
    beforeEach(async () => {
      context = {
        nxJsonConfiguration: {
          // These defaults should be overridden by plugin
          targetDefaults: {
            build: {
              cache: false,
              inputs: ['foo', '^foo'],
            },
          },
          namedInputs: {
            default: ['{projectRoot}/**/*'],
            production: ['!{projectRoot}/**/*.spec.ts'],
          },
        },
        workspaceRoot: '',
      };
    });

    afterEach(() => {
      jest.resetModules();
    });

    it('should create nodes - with test too', async () => {
      const nodes = await createNodesFunction(
        'vite.config.ts',
        {
          buildTargetName: 'build',
          serveTargetName: 'serve',
          previewTargetName: 'preview',
          testTargetName: 'test',
          serveStaticTargetName: 'serve-static',
        },
        context
      );

      expect(nodes).toMatchSnapshot();
    });
  });
});
