const {sendSlackMessage} = require("./slackSender");

const PULL_REQUEST_EVENTS = {
    CREATED: 'pullrequest:created',
    CLOSED: 'pullrequest:rejected',
    APPROVED: 'pullrequest:approved',
    UNAPPROVED: 'pullrequest:unapproved',
    MERGED: 'pullrequest:fulfilled',
    CHANGES_REQUEST_CREATED: 'pullrequest:changes_request_created',
    CHANGES_REQUEST_REMOVED: 'pullrequest:changes_request_removed',
    COMMENT_CREATED: 'pullrequest:comment_created',
    COMMENT_DELETED: 'pullrequest:comment_deleted',
    COMMENT_RESOLVED: 'pullrequest:comment_resolved',
    UPDATE: 'pullrequest:updated',
    COMMIT_PUSH: 'repo:push',
    BUILD_STATUS_CREATED: 'repo:commit_status_created',
    BUILD_STATUS_UPDATED: 'repo:commit_status_updated',
};

const BITBUCKET_BUILD_STATUS = {
    'INPROGRESS': 'INPROGRESS',
    'SUCCESSFUL': 'SUCCESSFUL',
    'FAILED': 'FAILED',
    'CANCELLED': 'CANCELLED',
    'UNKNOWN': 'UNKNOWN',
    'STOPPED': 'STOPPED'
}

const handleBitbucketWebhookEvent = async (bitbucketEvent, payload) => {
    // https://support.atlassian.com/bitbucket-cloud/docs/event-payloads/#Build-status-updated
    console.log('[AppBitbucket] Event', JSON.stringify(payload));

    let pullRequest;
    let approval;
    let actor;
    let changesRequest;
    let comment;
    let message;
    switch (bitbucketEvent) {
        case PULL_REQUEST_EVENTS.CREATED:
            pullRequest = mapBitbucketPullRequest(payload);

            message = "New pull request created" +
                "\nTitle: " + pullRequest.title +
                "\nDescription: " + pullRequest.description +
                "\nName: " + pullRequest.author.name +
                "\nURL: " + pullRequest.url;
            break;
        case PULL_REQUEST_EVENTS.CLOSED:
            pullRequest = mapBitbucketPullRequest(payload);
            const closedBy = mapClosedBy(payload);

            message = "Pull request closed" +
                "\nTitle: " + pullRequest.title +
                "\nClosed by: " + closedBy.name +
                "\nReason: " + closedBy.reason +
                "\nURL: " + pullRequest.url;
            break;
        case PULL_REQUEST_EVENTS.APPROVED:
            pullRequest = mapBitbucketPullRequest(payload);
            approval = mapBitbucketApproval(payload);

            message = "Pull request approved" +
                "\nTitle: " + pullRequest.title +
                "\nApproved by: " + approval.user.name +
                "\nDate: " + approval.date +
                "\nURL: " + pullRequest.url;
            break;
        case PULL_REQUEST_EVENTS.UNAPPROVED:
            pullRequest = mapBitbucketPullRequest(payload);
            approval = mapBitbucketApproval(payload);

            message = "Pull request unapproved" +
                "\nTitle: " + pullRequest.title +
                "\nUnapproved by: " + approval.user.name +
                "\nDate: " + approval.date +
                "\nURL: " + pullRequest.url;
            break;
        case PULL_REQUEST_EVENTS.CHANGES_REQUEST_CREATED:
            pullRequest = mapBitbucketPullRequest(payload);
            changesRequest = mapBitbucketChangesRequest(payload);

            message = "Changes requested for pull request" +
                "\nTitle: " + pullRequest.title +
                "\nRequested by: " + changesRequest.user.name +
                "\nDate: " + changesRequest.date +
                "\nURL: " + pullRequest.url;
            break;
        case PULL_REQUEST_EVENTS.CHANGES_REQUEST_REMOVED:
            pullRequest = mapBitbucketPullRequest(payload);
            changesRequest = mapBitbucketChangesRequest(payload);

            message = "Changes request removed for pull request" +
                "\nTitle: " + pullRequest.title +
                "\nRemoved by: " + changesRequest.user.name +
                "\nDate: " + changesRequest.date +
                "\nURL: " + pullRequest.url;
            break;
        case PULL_REQUEST_EVENTS.MERGED:
            pullRequest = mapBitbucketPullRequest(payload);
            const mergedBy = mapClosedBy(payload);

            message = "Pull request merged" +
                "\nTitle: " + pullRequest.title +
                "\nMerged by: " + mergedBy.name +
                "\nReason: " + mergedBy.reason +
                "\nURL: " + pullRequest.url;
            break;
        case PULL_REQUEST_EVENTS.COMMENT_CREATED:
            pullRequest = mapBitbucketPullRequest(payload);
            comment = mapBitbucketComment(payload);

            message = "New comment on pull request" +
                "\nTitle: " + pullRequest.title +
                "\nComment by: " + comment.user.name +
                "\nDate: " + comment.date +
                "\nContent: " + comment.content +
                "\nURL: " + pullRequest.url;
            break;
        case PULL_REQUEST_EVENTS.COMMENT_RESOLVED:
            pullRequest = mapBitbucketPullRequest(payload);
            comment = mapBitbucketComment(payload);
            actor = mapActor(payload);

            message = "Comment resolved on pull request" +
                "\nTitle: " + pullRequest.title +
                "\nResolved by: " + actor.name +
                "\nDate: " + comment.date +
                "\nContent: " + comment.content +
                "\nURL: " + pullRequest.url;
            break;
        case PULL_REQUEST_EVENTS.BUILD_STATUS_CREATED:
        case PULL_REQUEST_EVENTS.BUILD_STATUS_UPDATED:
            const buildStatus = mapBitbucketBuildStatus(payload);

            message = "Build status updated" +
                "\nName: " + buildStatus.name +
                "\nState: " + buildStatus.state +
                "\nCommit hash: " + buildStatus.commitHash;
            break;
        default:
            console.log('[AppBitbucket] Event not handled:', bitbucketEvent);
    }

    if (message) {
        await sendSlackMessage(message);
    }
}

const mapBitbucketPullRequest = (payload) => {
    const pullRequest = {
        id: '' + payload.pullrequest.id,
        url: payload.pullrequest.links.html.href,
        title: payload.pullrequest.title,
        description: payload.pullrequest.description,
        author: {
            name: payload.pullrequest.author.display_name,
            id: payload.pullrequest.author.uuid
        },
        reviewers: payload.pullrequest.reviewers.map(reviewer => ({
            id: reviewer.uuid,
            name: reviewer.display_name
        })),
        latestCommitHash: payload.pullrequest.source.commit.hash,
    };
    return pullRequest;
};

const mapBitbucketApproval = (payload) => {
    const approval = {
        user: {
            id: payload.approval.user.uuid,
            name: payload.approval.user.display_name
        },
        date: payload.approval.date
    };
    return approval;
};

const mapBitbucketChangesRequest = (payload) => {
    const changesRequest = {
        user: {
            id: payload.changes_request.user.uuid,
            name: payload.changes_request.user.display_name
        },
        date: payload.changes_request.date
    };
    return changesRequest;
};

const mapBitbucketComment = (payload) => {
    const comment = {
        id: '' + payload.comment.id,
        user: {
            id: payload.comment.user.uuid,
            name: payload.comment.user.display_name
        },
        date: payload.comment.date,
        content: payload.comment.content.raw,
        codeContext: payload.comment.inline?.context_lines,
        file: payload.comment.inline?.path,
        parentId: payload.comment.parent?.id
    };
    return comment;
};

const mapClosedBy = (payload) => {
    const closedBy = {
        id: payload.pullrequest.closed_by.uuid,
        name: payload.pullrequest.closed_by.display_name,
        reason: payload.pullrequest.reason
    };
    return closedBy;
}

const mapBitbucketCommitUser = (payload) => {
    const oldAuthor = payload.push?.changes?.[0]?.old?.target?.author;
    const newAuthor = payload.push?.changes?.[0]?.new?.target?.author;

    const author = newAuthor || oldAuthor;
    if (!author) {
        return;
    }
    const {name, email} = parseAuthorString(author.raw);
    const commitUserDetails = {
        id: payload.actor.uuid,
        name,
        email
    };
    return commitUserDetails;
}

const mapActor = (payload) => {
    const actor = {
        id: payload.actor.uuid,
        name: payload.actor.display_name
    };
    return actor;
}

const mapBitbucketBuildStatus = (payload) => {
    const buildStatus = {
        name: payload.commit_status.name,
        state: BITBUCKET_BUILD_STATUS[payload.commit_status.state],
        commitHash: payload.commit_status.commit.hash,
    };
    return buildStatus;
}

function parseAuthorString(authorString) {
    const regex = /^(.*?)\s*<(.+?)>$/;
    const match = authorString.match(regex);

    if (match) {
        const [, name, email] = match;
        return { name, email };
    } else {
        return null; // or throw an error, depending on your preference
    }
}

module.exports = {
    handleBitbucketWebhookEvent
}