# A Quick POC for a GitHub App

This was thrown together to get a sense for what it would take to create a github app. This responds to new PRs with a fake status check and auto-responds to new issues. These aren't really useful on their own, but provide a working example of the code required to receive events from GitHub and to send data back through comments and PR status updates.

## App Setup

1. [Create the app](https://developer.github.com/apps/building-github-apps/creating-a-github-app/)
  - This is where you'll specify your webhook URL - For testing, it's probably best to start with an `ngrok` address for your local service
  - Set appropriate permissions
    - For this code to work, you'll want Read/Write for Pull requests, Commit statuses and Issues
  - Subscribe to events
    - Issues
    - Pull request
2. Install the app - From the app page under settings
  - https://github.com/settings/apps/APP-NAME/installations

## The Code

- `github-webhook-handler` package lets you create a handler middleware that can be loaded into express
  - Once middleware is in use, we just attach event handlers for the different events exposed by github with `handler.on(<event-name>, fn)`
- The `github-app` package is an abstraction to the GitHub Rest API
  - Requires your app id
  - Requires a private key file - generated via GitHub UI on the app page, under Private Key heading

## Executing The Code

Once the app is installed and an event has been sent, you can redeliver that event for testing. So for example, code that responds to a PR creation event will be triggered with the original PR, but instead of creating a new PR each time you update the code, you can continue to deliver that payload from the App settings. Go to the advanced tab under your app's settings `https://github.com/settings/apps/APP-NAME/advanced` and find the payload you need. Click `redeliver` and the same data will be sent to the webhook again.
