import { spawn } from 'child_process';

export const exec = (command: string, options?: any[]): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const cmd = spawn(command, {
      stdio: 'inherit',
      shell: true,
      ...options,
    });

    cmd.on('exit', exitCode => {
      if (exitCode === 0) {
        resolve(true);
      } else {
        const error = new Error('Command exited with non-zero exit code.');

        (error as any).code = exitCode;

        reject(error);
        process.exit(1);
      }
    });
  });
};
