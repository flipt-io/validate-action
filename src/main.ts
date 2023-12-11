import * as core from '@actions/core'
import * as glob from '@actions/glob'
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
    false
  )

  core.endGroup()

  if (!result.success) {
    core.setFailed(`flipt validate failed: ${result.stderr}`)
    return
  }

  const response = result.stdout
  core.debug(`flipt response: ${response}`)

  if (response.length === 0) {
    core.debug('flipt returned empty response')
    core.info('✅ No invalid files found')
    return
  }

  let errors = 0
  const json = JSON.parse(response, function (key, value) {
    // we want to remove all unicode control characters from the message

    if (key === 'message') {
      return value.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    }

    return value
  })

  if (!json.errors || json.errors.length === 0) {
    core.debug('flipt returned no errors')
    core.info('✅ No invalid files found')
    return
  }

  for (const error of json.errors) {
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
