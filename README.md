# GitHub action to add a changelog reminder

After installation this action will check that the files in a pull request contain a changelog. If it doesn't it will create the comment:

![changelog_comment](https://user-images.githubusercontent.com/1332395/64420560-76021d80-d097-11e9-936c-e1fc9e92fbfb.png)

The log must be a `.yml` file and be at any depth in a folder named `change_log`

The test for this is a regex `/change_log\/.*\/*.yml`

- `change_log/next/RU-3456.yml` ✅
- `changelog/RU-3456.yml` ❌

## Installation

To configure the action simply add the following lines to your `.github/workflows/rebase.yml` workflow file:

```yml
on: pull_request
name: Changelog Reminder
jobs:
  remind:
    name: Changelog Reminder
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@master
    - name: Changelog Reminder
      uses: peterjgrainger/action-changelog-reminder@1.0
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
