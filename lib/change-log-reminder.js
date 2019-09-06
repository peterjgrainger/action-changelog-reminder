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
Object.defineProperty(exports, "__esModule", { value: true });
const noDuplicateComment_1 = require("./noDuplicateComment");
const createComment_1 = require("./createComment");
const fileMissing_1 = require("./fileMissing");
const githubToken_1 = require("./githubToken");
function changeLogReminder(Github, actionContext, core) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const octokit = new Github(githubToken_1.githubToken());
            const pr = actionContext.payload.pull_request;
            if (pr && (yield fileMissing_1.fileMissing(octokit, actionContext, pr.number)) && (yield noDuplicateComment_1.noDuplicateComment(octokit, actionContext, pr.number))) {
                yield createComment_1.createComment(octokit, actionContext, actionContext.issue.number);
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
exports.changeLogReminder = changeLogReminder;
