import * as os from 'os';
import * as core from '@actions/core';
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

export async function downloadFlipt(version: string): Promise<void> {
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

  try {
    const pullArgs = ['pull', `ghcr.io/flipt-io/flipt:${version}`];
    const result = await exec('docker', pullArgs, true);

    if (!result.success) {
      throw new Error(`Failed to pull flipt image: ${result.stderr}`);
    }

    core.info('Successfully pulled flipt image from ghcr.io');
  } catch (error) {
    throw new Error(`Failed to pull flipt image: ${error}`);
  }
}

