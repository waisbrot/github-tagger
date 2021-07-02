import * as core from "@actions/core";
import * as github from "@actions/github";

async function run() {
  try {
    const token = core.getInput("repo-token", { required: true });
    const tag = core.getInput("tag", { required: true });
    const sha =
      core.getInput("commit-sha", { required: false }) || github.context.sha;
    const existsAction =
      core.getInput("when-tag-exists", { required: false }) || "fail";

    const client = new github.GitHub(token);

    try {
      core.warning(`Testing for existing tag ${tag}`);
      await client.git.getRef({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        ref: `tags/${tag}`
      });
    } catch (_error) {
      core.warning(`No existing tag. Tagging #${sha} with tag ${tag}`);
      await client.git.createRef({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        ref: `refs/tags/${tag}`,
        sha: sha
      });
      return;
    }
    core.warning(`Tag already exists`);
    switch (existsAction) {
      case "fail":
        core.error("Tag exists already and existsAction is set to fail");
        core.setFailed("Tag exists already");
        return;
      case "skip":
        core.warning(`Skipping: tag already exists`);
        return;
      case "overwrite":
        core.warning(`Replacing existing tag with #${sha}`);
        await client.git.updateRef({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          ref: `refs/tags/${tag}`,
          sha: sha,
          force: true
        });
      default:
        core.error(
          `Bad value for parameter existsAction. Got '${existsAction}' but allowed values are {fail, skip, overwrite}`
        );
        core.setFailed("Bad value for parameter existsAction");
    }
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

run();
