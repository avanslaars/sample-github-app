//@ts-check
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const createHandler = require('github-webhook-handler')
const createApp = require('github-app')

const server = express()

const handler = createHandler({
  path: '/',
  secret: process.env.SECRET
})

server.use('/gh', handler)

const app = createApp({
  id: process.env.GITHUB_APP_ID, // find your app id on the app page under "About"
  cert: fs.readFileSync('private-key.pem') // generate this through the GitHub UI for your app
})

// detect the incoming PR and set the status to pending
// Then save the information needed to connect as the installation & do the status update/comment later:
// - event.payload.installation.id
// - event.payload.repository.owner.login
// - event.payload.repository.name
// - event.payload.number
// - event.payload.pull_request.head.sha
// Then, once things have happened in the dashboard, etc.
// Update the status, comment on the PR, etc.
handler.on('pull_request', function(event) {
  // New PR opened
  if (event.payload.action === 'opened') {
    // Act as app installation & set status to pending (prevent merge)
    const installation = event.payload.installation.id
    app.asInstallation(installation).then(github => {
      // Docs: https://octokit.github.io/rest.js/#api-Repos-createStatus
      github.repos.createStatus({
        owner: event.payload.repository.owner.login,
        repo: event.payload.repository.name,
        sha: event.payload.pull_request.head.sha,
        state: 'pending',
        context: 'AVS Sample',
        description: 'AVS Sample - description'
      })
      // SAVE DATA FOR LATER STATUS UPDATE

      // ... later - update the status
      // Strictly for demo purposes... wait 10 seconds and set status to success
      setTimeout(() => {
        // Comments at the top level of a PR go through the `issues` API
        // GitHub views PRs as issues with code.
        // When viewed through that lens, it makes sense.
        github.issues.createComment({
          owner: event.payload.repository.owner.login,
          repo: event.payload.repository.name,
          number: event.payload.number,
          body: 'This PR has the bots approval'
        })

        github.repos.createStatus({
          owner: event.payload.repository.owner.login,
          repo: event.payload.repository.name,
          sha: event.payload.pull_request.head.sha,
          state: 'success', // update status to green
          context: 'AVS Sample',
          description: 'AVS Sample - description'
        })
      }, 10000)
    })
  }
})

// Respond to an issue immediately by adding an automated comment
// Just a simple example
handler.on('issues', function (event) {
  if (event.payload.action === 'opened') {
    const installation = event.payload.installation.id
    app.asInstallation(installation).then(github => {
      github.issues.createComment({
        owner: event.payload.repository.owner.login,
        repo: event.payload.repository.name,
        number: event.payload.issue.number,
        body: 'We are experiencing higher than normal issue volumes. Someone will look at this issue as soon as possible'
      })
    })
  }
})

server.listen(7777, () => console.log('Server running on 7777'))
