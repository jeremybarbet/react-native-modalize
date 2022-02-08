import * as core from '@actions/core';

import { exec } from './utils/exec';
import { checkOutRemoteBranch, getChangedFiles, getFirstCommitRevision } from './utils/git';
import { getContext } from './utils/github';
import { runCmd } from './utils/run';

const TS = '.ts';
const TSX = '.tsx';

const lint = async (sha: string, isPullRequest: boolean) => {
  const filesChanged = getChangedFiles(sha, isPullRequest);
  core.info(`List of files changed ${filesChanged.join(', ')}`);

  core.info('⚡️ Running tsc...');
  await exec('tsc -p tsconfig.json --noEmit --skipLibCheck');

  const eslintFiles = filesChanged.filter(
    file => file.indexOf(TS) !== -1 || file.indexOf(TSX) !== -1,
  );

  if (eslintFiles.length) {
    core.info('⚙️  Running eslint...');
    await exec(`eslint --no-error-on-unmatched-pattern ${eslintFiles.join(' ')}`);
  }

  if (filesChanged.length) {
    core.info('✍️  Running prettier...');
    await exec(
      `prettier --check --ignore-unknown --no-error-on-unmatched-pattern ${filesChanged.join(' ')}`,
    );
  }
};

const actionsRun = async () => {
  const { branch, eventName } = getContext();
  const isPullRequest = eventName === 'pull_request' || eventName === 'pull_request_target';

  core.info(`Current branch "${branch}"`);

  if (isPullRequest) {
    checkOutRemoteBranch(branch);

    const sha = getFirstCommitRevision(branch);

    core.info(`Current commit sha "${sha}"`);

    await lint(sha, true);
  } else {
    const sha = getFirstCommitRevision(branch);

    core.info(`Current commit sha "${sha}"`);

    await lint(sha, false);
  }
};

const localRun = async () => {
  const branch = runCmd('git rev-parse --abbrev-ref HEAD').stdout ?? 'development';
  const sha = getFirstCommitRevision(branch);

  core.info(`Current commit sha "${sha}"`);

  await lint(sha, false);
};

const run = async () => {
  const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

  if (isGithubActions) {
    await actionsRun();
  } else {
    await localRun();
  }
};

void run();
