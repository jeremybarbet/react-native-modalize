import * as core from '@actions/core';

import { RunCmd, runCmd } from './run';

const BASE = 'master';
const IGNORE_LIST: string[] = [];

const getLines = (res: RunCmd) => res.stdout.split('\n');

export const checkOutRemoteBranch = (branch: string): void => {
  core.info('Fetching master and pull request branch');
  runCmd(`git fetch origin ${branch}:${branch} ${BASE}:${BASE}`);

  // Switch to remote branch
  core.info(`Switching to the "${branch}" branch`);
  runCmd(`git checkout ${branch}`);
};

export const getFirstCommitRevision = (branch: string): string => {
  return runCmd(`git merge-base remotes/origin/${branch} origin/${BASE}`).stdout;
};

export const getChangedFiles = (revision: string | null, isPullRequest: boolean): string[] => {
  try {
    const base = [
      ...getLines(runCmd(`git diff --name-only --diff-filter=ACMRTUB ${revision ?? ''}`)),
      ...getLines(runCmd('git ls-files --others --exclude-standard')),
    ];

    if (!isPullRequest) {
      base.push(
        ...getLines(runCmd(`git diff-tree --no-commit-id --name-only -r ${revision ?? ''}`)),
      );
    }

    return base.filter((path: string) => !IGNORE_LIST.includes(path)).filter(Boolean);
  } catch (error) {
    if (error instanceof Error) {
      core.error(`getChangedFiles error ${error.message}`);
    }

    return [];
  }
};
