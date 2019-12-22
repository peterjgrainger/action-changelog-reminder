# GitHub action to add a changelog reminder

After installation this action will check that the files in a pull request
contain a changelog. If the changelog is not present,  the action will create
the comment:

![changelog_comment](https://user-images.githubusercontent.com/1332395/64420560-76021d80-d097-11e9-936c-e1fc9e92fbfb.png)

The test for changelog defaults to the regex `/change_log\/.*\/*.yml`

- `change_log/next/RU-3456.yml` ✅
- `changelog/RU-3456.yml` ❌

But you can supply your regex for changelogs (see example below)

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
      uses: peterjgrainger/action-changelog-reminder@v1.1.1
      with:
        changelog_regex: '/change_log\/.*\/*.yml'
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
