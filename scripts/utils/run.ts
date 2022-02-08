import { execSync, ExecSyncOptionsWithStringEncoding } from 'child_process';

export interface RunCmd {
  status: number;
  stdout: string;
  stderr: string;
}

export const runCmd = (cmd: string, options?: ExecSyncOptionsWithStringEncoding): RunCmd => {
  const optionsWithDefaults = {
    dir: '.',
    ignoreErrors: false,
    prefix: '',
    ...options,
  };

  try {
    const stdout = execSync(cmd, {
      encoding: 'utf8',
      cwd: optionsWithDefaults.dir,
      maxBuffer: 20 * 1024 * 1024,
    });

    const output = {
      status: 0,
      stdout: stdout.trim(),
      stderr: '',
    };

    return output;
  } catch (err: any) {
    if (optionsWithDefaults.ignoreErrors) {
      const output = {
        status: err.status,
        stdout: err.stdout.trim(),
        stderr: err.stderr.trim(),
      };

      return output;
    }

    throw err;
  }
};
