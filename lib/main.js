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
            const myInput = core.getInput('myInput');
            const token = process.env.GITHUB_TOKEN || '';
            const octokit = new toolkit.GitHub(token);
            const context = toolkit.context;
            const pr = context.payload.pull_request;
            if (pr) {
                console.dir(pr.number);
                const files = yield octokit.pulls.listFiles(Object.assign(Object.assign({}, context.repo), { pull_number: pr.number }));
                console.log(files.data.join(','));
            }
            else {
                console.log('no pr');
            }
            core.debug(`Hello ${myInput}`);
        }
        catch (error) {
            console.log('failed');
            core.setFailed(error.message);
        }
    });
}
run();
