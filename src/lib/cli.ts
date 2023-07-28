import * as os from 'os';
import * as path from 'path';
import * as core from '@actions/core';
import * as github from '@actions/github';
import * as io from '@actions/io';
import { exec } from './exec';

function getPlatform(): string | undefined {
  const platforms = {
    'linux-x64': 'x86_64-unknown-linux-musl',
    // 'linux-arm64': 'linux-arm64',
    // 'darwin-x64': 'darwin-x64',
    // 'darwin-arm64': 'darwin-arm64',
    // 'win32-x64': 'windows-x64'
  };

  const runnerPlatform = os.platform();
  const runnerArch = os.arch();

  return platforms[`${runnerPlatform}-${runnerArch}` as keyof typeof platforms];
}

export async function downloadFlipt(image: string): Promise<void> {
  const platform = getPlatform();
  if (!platform) {
    throw new Error('Unsupported platform');
  }

  // check if docker is available
  const isDockerInstalled = await io.which('docker', true);

  if (!isDockerInstalled) {
    throw new Error('Docker is required on host');
  }

  core.debug('Docker is installed on host');

  const token = ensureGitHubToken();

  try {
    const loginArgs = [
      'login',
      'ghcr.io',
      '--username',
      github.context.actor,
      '--password-stdin',
    ];
    const result = await exec('docker', loginArgs, true, {
      input: Buffer.from(token),
    });

    if (!result.success) {
      throw new Error(`Failed to login to ghcr.io: ${result.stderr}`);
    }
  } catch (error) {
    throw new Error(`Failed to login to ghcr.io: ${error}`);
  }

  core.debug('Successfully logged in to ghcr.io');

  try {
    const pullArgs = ['pull', `ghcr.io/flipt-io/${image}`];
    const result = await exec('docker', pullArgs, true);

    if (!result.success) {
      throw new Error(`Failed to pull flipt image: ${result.stderr}`);
    }

    core.info('Successfully pulled flipt image from ghcr.io');
  } catch (error) {
    throw new Error(`Failed to pull flipt image: ${error}`);
  }
}

function ensureGitHubToken(): string {
  let token: string | undefined = core.getInput('github-token');
  if (!token || token.length === 0) {
    token = process.env.GITHUB_TOKEN;
  }
  if (!token || token.length === 0) {
    throw new Error('GitHub token is required');
  }

  core.debug('GitHub token is present');
  return token;
}
