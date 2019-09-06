"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function missingChangelogContent(actionContext) {
    return `@${actionContext.actor} your pull request is missing a changelog!`;
}
exports.missingChangelogContent = missingChangelogContent;
