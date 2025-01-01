# Slack-Bitbucket Webhook Integration

This Node.js application integrates Bitbucket with Slack by consuming Bitbucket pull request events via webhooks and sending corresponding messages to a Slack channel.

## Features

- Receives Bitbucket pull request events through webhooks.
- Sends formatted notifications to a specified Slack channel via webhooks.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 14.x or higher)
- A Slack workspace with permission to manage webhooks
- Administrative access to the Bitbucket repository

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/maksouth/slack-bitbucket-webhook-integration.git
   cd slack-bitbucket-webhook-integration
   ```

   Install dependencies:
   ```bash
   npm install
   ```
  

2. **Configure environment variables:**
- Update SLACK_WEBHOOK_URL and SLACK_CHANNEL in slackSender.js

3. **Start server:**
```bash
node index.js
```
Server will run on port 3000.
Start Ngrok:
```bash
ngrok http 3000
```

4. **Further steps:**
Read how to configure Slack and Bitbucket webhooks and test integration [here](https://reviewnudgebot.com/blog/complete-and-secure-slack-bitbucket-integration-in-20-minutes-no-oauth-no-db/)
