import * as aexec from '@actions/exec';
import * as core from '@actions/core';

export interface ExecResult {
  success: boolean;
  stdout: string;
  stderr: string;
}

export const exec = async (
  command: string,
  args: string[] = [],
  opts = {},
): Promise<ExecResult> => {
  const eopts: aexec.ExecOptions = {
    silent: false,
    ignoreReturnCode: true,
    ...opts,
  };

  core.debug(`running ${command} ${args.join(' ')}, opts: ${JSON.stringify(eopts)}`);

  const { exitCode, stdout, stderr } = await aexec.getExecOutput(
    command,
    args,
    eopts,
  );

  return {
    success: exitCode === 0,
    stdout: stdout.trim(),
    stderr: stderr.trim(),
  };
};
