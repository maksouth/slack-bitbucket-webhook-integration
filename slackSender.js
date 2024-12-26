const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
const SLACK_CHANNEL = 'test-bitbucket-slack-webhook-integration';


const sendSlackMessage = async (message) => {
    const slackMessage = {
        channel: SLACK_CHANNEL,
        text: message,
    };

    const response = await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(slackMessage),
    });

    if (!response.ok) {
        console.log('Error sending message to Slack:', response.statusText);
    }
};

module.exports = {
    sendSlackMessage
};