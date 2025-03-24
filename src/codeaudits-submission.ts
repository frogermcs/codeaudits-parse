import * as core from '@actions/core'
import axios from 'axios'
/**
 * Submit parsed repositoiry to CodeAudits.ai
 */
export async function submitToCodeAudits(
  content: string,
  metadata: { [key: string]: string | number | Record<string, number> },
  basePath: string,
  apiKey?: string
): Promise<void> {
  const headers: { [key: string]: string } = {
    'Content-Type': 'application/json',
    'x-submitted-by': 'CodeAudits-Repomix-Action'
  }
  if (apiKey) {
    headers['x-api-key'] = apiKey
  }

  const payload = {
    text: content
  }

  const futurePayload = {
    content: "content goes here",
    repository: process.env.GITHUB_REPOSITORY,
    metadata: metadata
  }

  core.info("Preview of the future payload:")
  core.info(JSON.stringify(futurePayload, null, 2))

  const submission = await axios
    .post(`${basePath}api/repo/add`, payload, {
      headers
    })
    .catch(error => {
      core.error('Failed to push code to CodeAudits')
      core.error(JSON.stringify(error.response.data, null, 2))
      core.setFailed('Failed to push code to CodeAudits')
    })

  if (submission) {
    core.info('Code pushed to CodeAudits')
    core.debug(JSON.stringify(submission.data, null, 2))
    core.setOutput('submission-status', JSON.stringify(submission.data))

    core.summary.addHeading('Code Submission Summary', 2)
    core.summary.addCodeBlock(JSON.stringify(submission.data, null, 2), 'json')
    if (submission.data.url) {
      core.summary.addLink('CodeAudits URL', submission.data.url)
    }
  }
}
