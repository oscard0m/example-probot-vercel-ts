import { suite } from "uvu";
import assert from "uvu/assert";

import nock from "nock";
nock.disableNetConnect();

import { Probot, ProbotOctokit } from "probot";
import { EmitterWebhookEvent } from "@octokit/webhooks";

import app from "../src/app";

let probot: Probot;
const test = suite("app");
test.before.each(() => {
  probot = new Probot({
    // simple authentication as alternative to appId/privateKey
    githubToken: "test",
    // disable logs
    logLevel: "warn",
    // disable request throttling and retries
    Octokit: ProbotOctokit.defaults({
      throttle: { enabled: false },
      retry: { enabled: false },
    }),
  });
  probot.load(app);
});

test("recieves issues.opened event", async function () {
  const mock = nock("https://api.github.com")
    // create new check run
    .post(
      "/repos/probot/example-vercel/issues/1/comments",
      (requestBody: Body) => {
        assert.equal(requestBody, { body: "Hello, World!" });

        return true;
      }
    )
    .reply(201, {});

  await probot.receive({
    name: "issues",
    id: "1",
    payload: {
      action: "opened",
      repository: {
        owner: {
          login: "probot",
        },
        name: "example-vercel",
      },
      issue: {
        number: 1,
      },
    },
  } as EmitterWebhookEvent<any>);

  assert.equal(mock.activeMocks(), []);
});

test.run();
