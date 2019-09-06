"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function githubToken() {
    const token = process.env.GITHUB_TOKEN;
    if (!token)
        throw ReferenceError('No token defined in the environment variables');
    return token;
}
exports.githubToken = githubToken;
