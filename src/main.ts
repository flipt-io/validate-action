import * as core from '@actions/core'
import {downloadFlipt} from './lib/cli'
import {environmentVariables} from './lib/environment'
import {exec} from './lib/exec'

async function run(): Promise<void> {
  try {
    const argsInput = core.getInput('args')

    // split args by whitespace
    const args = argsInput
      .trim()
      .split(/\s+/)
      .filter(arg => arg !== '')
      .filter(arg => arg.length > 0)

    await validate(args)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function validate(args: string[] = []): Promise<void> {
  core.startGroup(`Installing flipt:latest`)
  await downloadFlipt()
  core.endGroup()

  let workspace = core.getInput('working-directory')

  if (!workspace || workspace.length === 0) {
    workspace = environmentVariables.GITHUB_WORKSPACE
  }

  const continueOnError = args.includes('--continue-on-error')

  core.debug(`running flipt in workspace: ${workspace}`)

  core.startGroup('Running flipt validate')

  const result = await exec(
    'flipt',
    ['validate', '--issue-exit-code=0', '--format=json'],
    {
      env: {
        FLIPT_LOG_LEVEL: 'fatal'
      }
    }
  )

  core.endGroup()

  if (!result.success) {
    core.setFailed(`flipt validate failed: ${result.stderr}`)
    return
  }

  // TODO: hack to get second line of output until env vars can override default config
  const lines = result.stdout.toString().split('\n')
  if (lines.length < 2) {
    core.setFailed('flipt validate returned invalid output')
    return
  }

  // get second line of output
  const line = lines[1]

  const response = line.trim()

  core.debug(`flipt response: ${response}`)

  if (response.length === 0) {
    core.debug('flipt returned empty response')
    core.info('✅ No invalid files found')
    return
  }

  let errors = 0
  const json = JSON.parse(response)

  // reponse looks like :
  // [{"message":"flags.0.rules.0.distributions.0.rollout: invalid value 110 (out of bound \\u003c=100)","location":{"file":"features.yaml","line":17}}]
  // loop through objects in response

  for (const error of json) {
    errors += 1
    const {message, location} = error

    // TODO: hack
    const file = location.file.replace('/workspace/', '')

    const opts: core.AnnotationProperties = {
      file,
      startLine: location.line
    }

    core.error(message, opts)
  }

  const msg = `Found ${errors} error(s) when validating features.yml`
  if (continueOnError) {
    core.warning(msg)
    return
  }
  core.setFailed(msg)
}

run()
