const SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/XXXXX/XXXXXXX/XXXXX'; // TODO use your Slack webhook URL here
const SLACK_CHANNEL = 'test-bitbucket-slack-webhook-integration'; // TODO use your Slack channel here


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