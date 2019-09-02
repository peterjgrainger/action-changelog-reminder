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
const toolkit = __importStar(require("@actions/github"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(JSON.stringify(toolkit.context, null, 4));
            const octokit = new toolkit.GitHub(token());
            const pr = toolkit.context.payload.pull_request;
            if (pr && (yield changeLogExists(octokit, pr)) && (yield commentNotAlreadyThere(octokit))) {
                createComment(octokit);
            }
            else {
                core.debug('PR or changelog doesn\'t exist');
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
function changeLogExists(octokit, pr) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield octokit.pulls.listFiles(Object.assign(Object.assign({}, toolkit.context.repo), { pull_number: pr.number }));
        const changlelogFiles = files.data.filter(value => /change_log\/.*\/*.yml/.test(value.filename));
        return changlelogFiles.length === 0;
    });
}
function commentNotAlreadyThere(octokit) {
    return __awaiter(this, void 0, void 0, function* () {
        const comments = yield octokit.issues.listComments(Object.assign(Object.assign({}, toolkit.context.repo), { issue_number: toolkit.context.issue.number }));
        return comments.data.filter(comment => comment.body === missingChangelogContent()).length === 0;
    });
}
function createComment(octokit) {
    return __awaiter(this, void 0, void 0, function* () {
        yield octokit.issues.createComment(Object.assign(Object.assign({}, toolkit.context.repo), { issue_number: toolkit.context.issue.number, body: missingChangelogContent() }));
    });
}
function token() {
    const token = process.env.GITHUB_TOKEN;
    if (!token)
        throw ReferenceError('No token defined in the environment variables');
    return token;
}
function missingChangelogContent() {
    return `@${toolkit.context.actor} your pull request is missing a changelog!`;
}
run();
