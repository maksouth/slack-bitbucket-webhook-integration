const express = require("express");
const {handleBitbucketWebhookEvent} = require("./bitbucketController");

const app = express();
const port = 3000;

app.use(express.json())

app.post('/', async (req, res) => {
    const bitbucketEvent = req.headers['x-event-key'];

    console.log('[AppBitbucket] Received Bitbucket webhook event', req.headers);
    const payload = req.body;

    console.log('[AppBitbucket] Received Bitbucket webhook event', bitbucketEvent);
    console.log('[AppBitbucket] Received webhook event keys', Object.keys(payload));


    await handleBitbucketWebhookEvent(bitbucketEvent, payload);

    res.status(200).send({ message: 'success' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
