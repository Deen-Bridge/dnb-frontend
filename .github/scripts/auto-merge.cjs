"use strict";

const POLICIES = {
  "dnb-frontend": {
    base: "main",
    checks: ["Lint and Build", "Lighthouse CI"],
  },
  "dnb-backend": {
    base: "main",
    checks: ["Run Tests", "Syntax and Boot Check", "Stryker Mutation Testing"],
    contractCheck: "Rust contract checks",
  },
  "dnb-ai": {
    base: "dev",
    checks: ["Lint and Test"],
  },
};

const ACCEPTED_CONCLUSIONS = new Set(["success", "neutral", "skipped"]);
const BLOCKING_LABELS = new Set(["hold", "do-not-merge", "manual-review"]);
const CLOSE_KEYWORDS = /\b(?:close[sd]?|fix(?:es|ed)?|resolve[sd]?)\s+#(\d+)\b/gi;

function closingIssueNumbers(body) {
  // Ignore examples in fenced or inline code so documentation snippets do not
  // accidentally close an issue.
  const prose = (body || "").replace(/```[\s\S]*?```/g, "").replace(/`[^`]*`/g, "");
  const numbers = new Set();
  const matcher = new RegExp(CLOSE_KEYWORDS.source, "gi");
  for (const match of prose.matchAll(matcher)) numbers.add(Number(match[1]));
  return [...numbers];
}

function latestBy(items, keyFor, timeFor) {
  const latest = new Map();
  for (const item of items) {
    const key = keyFor(item);
    const current = latest.get(key);
    if (!current || Date.parse(timeFor(item) || "") > Date.parse(timeFor(current) || "")) {
      latest.set(key, item);
    }
  }
  return [...latest.values()];
}

async function reviewState(github, owner, repo, number) {
  const query = `query($owner: String!, $name: String!, $number: Int!, $after: String) {
    repository(owner: $owner, name: $name) {
      pullRequest(number: $number) {
        reviewDecision
        mergeable
        mergeStateStatus
        reviewThreads(first: 100, after: $after) {
          nodes { isResolved }
          pageInfo { hasNextPage endCursor }
        }
      }
    }
  }`;

  let after = null;
  let decision = null;
  let mergeable = "UNKNOWN";
  let mergeStateStatus = "UNKNOWN";
  let unresolved = 0;
  do {
    const response = await github.graphql(query, { owner, name: repo, number, after });
    const pullRequest = response.repository?.pullRequest;
    if (!pullRequest) throw new Error(`Could not load review state for PR #${number}`);
    decision = pullRequest.reviewDecision;
    mergeable = pullRequest.mergeable;
    mergeStateStatus = pullRequest.mergeStateStatus;
    unresolved += pullRequest.reviewThreads.nodes.filter((thread) => !thread.isResolved).length;
    after = pullRequest.reviewThreads.pageInfo.hasNextPage
      ? pullRequest.reviewThreads.pageInfo.endCursor
      : null;
  } while (after);

  return { decision, mergeable, mergeStateStatus, unresolved };
}

async function headChecks(github, owner, repo, sha, expectedChecks) {
  const checks = await github.paginate(github.rest.checks.listForRef, {
    owner,
    repo,
    ref: sha,
    per_page: 100,
  });
  const statuses = await github.paginate(github.rest.repos.listCommitStatusesForRef, {
    owner,
    repo,
    ref: sha,
    per_page: 100,
  });

  // Ignore this workflow's own check while requiring all other reported checks to pass.
  const externalChecks = latestBy(
    checks.filter((check) => check.name !== "Merge when ready"),
    (check) => `${check.name}:${check.app?.id || "unknown"}`,
    (check) => check.started_at || check.completed_at,
  );
  const failedChecks = externalChecks.filter(
    (check) => check.status !== "completed" || !ACCEPTED_CONCLUSIONS.has(check.conclusion),
  );
  const latestStatuses = latestBy(statuses, (status) => status.context, (status) => status.updated_at);
  const failedStatuses = latestStatuses.filter((status) => status.state !== "success");
  const missingRequired = expectedChecks.filter(
    (name) => !externalChecks.some((check) => check.name === name && check.status === "completed" && check.conclusion === "success"),
  );

  return { failedChecks, failedStatuses, missingRequired };
}

async function linkedIssues(github, owner, repo, pullRequest) {
  const numbers = closingIssueNumbers(pullRequest.body);
  if (!numbers.length) return { issues: [], error: "PR description must include a closing reference such as `Closes #123`." };

  const issues = [];
  for (const number of numbers) {
    try {
      const { data } = await github.rest.issues.get({ owner, repo, issue_number: number });
      if (data.pull_request) {
        return { issues: [], error: `#${number} is a pull request, not an issue.` };
      }
      if (data.state === "closed" && data.state_reason !== "completed") {
        return { issues: [], error: `Linked issue #${number} is already closed as ${data.state_reason || "unknown"}.` };
      }
      issues.push({ number, state: data.state, stateReason: data.state_reason });
    } catch (error) {
      return { issues: [], error: `Could not verify linked issue #${number}: ${error.message}` };
    }
  }

  return { issues, error: null };
}

async function candidatePullRequests(github, context, owner, repo) {
  const payload = context.payload;
  if (payload.pull_request) return [payload.pull_request];

  if (context.eventName === "workflow_dispatch") {
    const number = Number(payload.inputs?.pr_number);
    if (!number) return [];
    const { data } = await github.rest.pulls.get({ owner, repo, pull_number: number });
    return [data];
  }

  if (context.eventName === "schedule") {
    return github.paginate(github.rest.pulls.list, {
      owner,
      repo,
      state: "open",
      base: POLICIES[repo].base,
      per_page: 100,
    });
  }

  const sha =
    payload.workflow_run?.head_sha ||
    payload.check_run?.head_sha ||
    payload.sha;
  if (!sha) return [];

  const { data } = await github.rest.repos.listPullRequestsAssociatedWithCommit({
    owner,
    repo,
    commit_sha: sha,
    per_page: 100,
  });
  return data;
}

async function run({ github, context, core }) {
  const { owner, repo } = context.repo;
  const policy = POLICIES[repo];
  if (!policy) throw new Error(`No auto-merge policy is configured for ${repo}`);

  const candidates = await candidatePullRequests(github, context, owner, repo);
  for (const candidate of candidates) {
    const number = candidate.number;
    const { data: pr } = await github.rest.pulls.get({ owner, repo, pull_number: number });
    const prefix = `PR #${number}:`;
    const skip = (reason) => core.info(`${prefix} ${reason}`);

    if (pr.state !== "open" || pr.base.ref !== policy.base) continue;
    if (pr.draft) {
      skip("is a draft; waiting for it to be marked ready.");
      continue;
    }
    const labels = new Set(pr.labels.map((label) => label.name.toLowerCase()));
    if ([...BLOCKING_LABELS].some((label) => labels.has(label))) {
      skip("has a hold label.");
      continue;
    }
    if (pr.requested_reviewers?.length || pr.requested_teams?.length) {
      skip("is still waiting on requested reviewers.");
      continue;
    }

    const issues = await linkedIssues(github, owner, repo, pr);
    if (issues.error) {
      skip(issues.error);
      continue;
    }

    const review = await reviewState(github, owner, repo, number);
    if (review.mergeable !== "MERGEABLE") {
      skip(`is not cleanly mergeable (${review.mergeable}).`);
      continue;
    }
    if (review.mergeStateStatus !== "CLEAN") {
      skip(`GitHub reports merge state ${review.mergeStateStatus}, not CLEAN.`);
      continue;
    }
    if (review.decision !== "APPROVED") {
      skip(`review decision is ${review.decision || "not approved"}.`);
      continue;
    }
    if (review.unresolved > 0) {
      skip(`has ${review.unresolved} unresolved review thread(s).`);
      continue;
    }

    const expectedChecks = [...policy.checks];
    if (policy.contractCheck) {
      const files = await github.paginate(github.rest.pulls.listFiles, {
        owner,
        repo,
        pull_number: number,
        per_page: 100,
      });
      if (files.some((file) => file.filename.startsWith("contracts/"))) {
        expectedChecks.push(policy.contractCheck);
      }
    }

    const checks = await headChecks(github, owner, repo, pr.head.sha, expectedChecks);
    if (checks.missingRequired.length) {
      skip(`waiting for required check(s): ${checks.missingRequired.join(", ")}.`);
      continue;
    }
    if (checks.failedChecks.length || checks.failedStatuses.length) {
      skip(
        `waiting for all checks/statuses to pass (${checks.failedChecks.length} check(s), ${checks.failedStatuses.length} status(es) pending or failed).`,
      );
      continue;
    }

    core.info(`${prefix} all gates pass; squash-merging ${pr.head.sha}.`);
    const mergeResult = await github.rest.pulls.merge({
      owner,
      repo,
      pull_number: number,
      merge_method: "squash",
      sha: pr.head.sha,
    });
    if (!mergeResult.data.merged) throw new Error(`${prefix} GitHub did not merge the pull request.`);

    for (const issue of issues.issues) {
      if (issue.state === "closed" && issue.stateReason === "completed") continue;
      await github.rest.issues.update({
        owner,
        repo,
        issue_number: issue.number,
        state: "closed",
        state_reason: "completed",
      });
      core.info(`${prefix} closed issue #${issue.number} as completed.`);
    }
  }
}

module.exports = { run };
