import axios from 'axios'
import { ICoreInterface } from './interfaces/core.interface.js'

/**
 * Submit parsed repository to CodeAudits.ai
 */
export async function submitToCodeAudits(
  content: string,
  metadata: { [key: string]: string | number | Record<string, number> },
  basePath: string,
  apiKey: string | undefined,
  coreImpl: ICoreInterface
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
    repository: process.env.GITHUB_REPOSITORY || 'local-repository',
    metadata: metadata
  }

  coreImpl.info("Preview of the future payload:")
  coreImpl.info(JSON.stringify(futurePayload, null, 2))

  const submission = await axios
    .post(`${basePath}api/repo/add`, payload, {
      headers
    })
    .catch(error => {
      coreImpl.error('Failed to push code to CodeAudits')
      coreImpl.error(JSON.stringify(error.response?.data || error.message, null, 2))
      coreImpl.setFailed('Failed to push code to CodeAudits')
    })

  if (submission) {
    coreImpl.info('Code pushed to CodeAudits')
    coreImpl.debug(JSON.stringify(submission.data, null, 2))
    coreImpl.setOutput('submission-status', JSON.stringify(submission.data))

    coreImpl.summary.addHeading('Code Submission Summary', 2)
    coreImpl.summary.addCodeBlock(JSON.stringify(submission.data, null, 2), 'json')
    if (submission.data.url) {
      coreImpl.summary.addLink('CodeAudits URL', submission.data.url)
    }
  }
}
