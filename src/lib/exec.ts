import * as aexec from '@actions/exec';

export interface ExecResult {
  success: boolean;
  stdout: string;
  stderr: string;
}

export const exec = async (
  command: string,
  args: string[] = [],
  silent?: boolean,
  opts = {},
): Promise<ExecResult> => {
  const eopts: aexec.ExecOptions = {
    silent: silent,
    ignoreReturnCode: true,
    ...opts,
  };
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
