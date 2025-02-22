import { FetchProjectGraphService } from '../fetch-project-graph-service';
import { ProjectGraphService } from '../interfaces';
import { LocalProjectGraphService } from '../local-project-graph-service';
import { MockProjectGraphService } from '../mock-project-graph-service';
import { NxConsoleProjectGraphService } from '../nx-console-project-graph-service';

let projectGraphService: ProjectGraphService;

export function getProjectGraphDataService() {
  if (projectGraphService === undefined) {
    if (window.environment === 'dev') {
      projectGraphService = new FetchProjectGraphService();
    } else if (window.environment === 'watch') {
      projectGraphService = new MockProjectGraphService();
    } else if (window.environment === 'nx-console') {
      projectGraphService = new NxConsoleProjectGraphService();
    } else if (window.environment === 'release') {
      if (window.localMode === 'build') {
        projectGraphService = new LocalProjectGraphService();
      } else {
        projectGraphService = new FetchProjectGraphService();
      }
    }
  }

  return projectGraphService;
}
