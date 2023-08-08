import * as os from 'os';
import * as core from '@actions/core';
import * as io from '@actions/io';
import * as github from '@actions/github';
import * as tc from '@actions/tool-cache';
import { exec } from './exec';
import path from 'path';
import fetch from "node-fetch";
import { Octokit } from '@octokit/rest';

function getPlatform(): string | undefined {
  const platforms = {
    'linux-x64': 'linux_x86_64',
    // 'linux-arm64': 'linux_arm64',
    // 'darwin-x64': 'darwin-x64',
    // 'darwin-arm64': 'darwin-arm64',
    // 'win32-x64': 'windows-x64'
  };

  const runnerPlatform = os.platform();
  const runnerArch = os.arch();

  return platforms[`${runnerPlatform}-${runnerArch}` as keyof typeof platforms];
}

export async function downloadFlipt(): Promise<void> {
  let octokit: any;

  const repoToken: string = core.getInput('github-token', { required: false })
  if (repoToken) {
    core.debug('Using provided github token');
    octokit = github.getOctokit(repoToken);
  } else {
    core.debug('No github token provided');
    octokit = new Octokit({
      request: {fetch: fetch},
    });
  }

  const platform = getPlatform();
  if (!platform) {
    throw new Error('Unsupported platform');
  }

  // check if flipt is already installed
  // if not, download it
  const isFliptInstalled = await io.which('flipt');

  if (isFliptInstalled) {
    core.info('flipt is already installed, skipping download');
    return;
  }

  core.info('flipt is not installed, proceeding to downloading');

  try {
    const release = await octokit.rest.repos.getLatestRelease({
      owner: 'flipt-io',
      repo: 'flipt',
    });

    const version = release.data.tag_name;

    core.debug(`Latest flipt release is ${version}`);

    const asset = release.data.assets.find(
      (asset: { name: string; }) => asset.name === `flipt_${platform}.tar.gz`,
    );

    const downloadUrl = asset?.browser_download_url;

    if (!downloadUrl) {
      throw new Error(`No download url found for ${platform}`);
    }

    core.debug(`Downloading from ${downloadUrl}`);

    const destination = path.join(os.homedir(), '.flipt/flipt');
    core.debug(`Install destination is ${destination}`);

    await io
      .rmRF(destination)
      .catch()
      .then(() => {
        core.debug(
          `Successfully deleted pre-existing ${destination} directory (if any)}`,
        );
      });

    const downloaded = await tc.downloadTool(downloadUrl);

    core.debug(`Successfully downloaded 'flipt-${version}' to ${downloaded}`);

    await io.mkdirP(destination);
    const extractedPath = await tc.extractTar(downloaded, destination);
    core.debug(`Successfully extracted ${downloaded} to ${extractedPath}`);

    const cachedPath = await tc.cacheDir(destination, 'flipt', version);

    core.addPath(cachedPath);
    core.debug(`Successfully cached ${destination} to ${cachedPath}`);

    const versionExec = await exec('flipt', ['--version'], true);
    if (!versionExec.success) {
      throw new Error(`flipt failed to run: ${versionExec.stderr.trim()}`);
    }

    core.info(`${versionExec.stdout.trim()} installed`);
  } catch (error) {
    throw new Error(`Failed to fetch latest release: ${error}`);
  }
}
