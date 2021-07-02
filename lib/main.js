"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const token = core.getInput('repo-token', { required: true });
            const tag = core.getInput('tag', { required: true });
            const sha = core.getInput('commit-sha', { required: false }) || github.context.sha;
            const existsAction = core.getInput('when-tag-exists', { required: false }) || 'fail';
            const client = new github.GitHub(token);
            try {
                core.debug(`Testing for existing tag ${tag}`);
                yield client.git.getRef({
                    owner: github.context.repo.owner,
                    repo: github.context.repo.repo,
                    ref: `tags/${tag}`,
                });
            }
            catch (_error) {
                core.debug(`No existing tag. Tagging #${sha} with tag ${tag}`);
                yield client.git.createRef({
                    owner: github.context.repo.owner,
                    repo: github.context.repo.repo,
                    ref: `refs/tags/${tag}`,
                    sha: sha
                });
                return;
            }
            core.debug(`Tag already exists`);
            switch (existsAction) {
                case 'fail':
                    core.error('Tag exists already and existsAction is set to fail');
                    core.setFailed('Tag exists already');
                    return;
                case 'skip':
                    core.debug(`Skipping: tag already exists`);
                    return;
                case 'overwrite':
                    core.debug(`Replacing existing tag with #${sha}`);
                    yield client.git.updateRef({
                        owner: github.context.repo.owner,
                        repo: github.context.repo.repo,
                        ref: `refs/tags/${tag}`,
                        sha: sha,
                        force: true
                    });
                default:
                    core.error(`Bad value for parameter existsAction. Got '${existsAction}' but allowed values are {fail, skip, overwrite}`);
                    core.setFailed('Bad value for parameter existsAction');
            }
        }
        catch (error) {
            core.error(error);
            core.setFailed(error.message);
        }
    });
}
run();
