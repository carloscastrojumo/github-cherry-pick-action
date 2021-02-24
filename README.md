<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# Cherry-picking a pull request commit into branchs

This action is designed to be used for cherry-pick commits from pull requests into release branches.

GitHub Cherry Pick Action will:

- Checkout triggered action.
- Create new branch name `cherry-pick-${GITHUB_SHA}` from `branch` input.
- Cherry-picking `${GITHUB_SHA}` into created `branch`
- Push new `branch` to remote
- Open pull request to `branch`

## Example

```yml
on:
  pull_request:
    branches:
      - master
    types: ["closed"]

jobs:
  cherry_pick_release_v1_0:
    runs-on: ubuntu-latest
    name: Cherry pick into release-v1.0
    if: contains(github.event.pull_request.labels.*.name, 'release-v1.0')
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Cherry pick into release-v1.0
        uses: carloscastrojumo/github-action-cherry-pick@master
        with:
          branch: release-v1.0
          labels: |
            cherry-pick
          reviewers: |
            aReviewerUser
  cherry_pick_release_v2_0:
    runs-on: ubuntu-latest
    name: Cherry pick into release-v2.0
    if: contains(github.event.pull_request.labels.*.name, 'release-v2.0')
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Cherry pick into release-v2.0
        uses: carloscastrojumo/github-action-cherry-pick@master
        with:
          branch: release-v2.0
          labels: |
            cherry-pick
          reviewers: |
            aReviewerUser
```

### Action inputs

| Name | Description | Default |
| --- | --- | --- |
| `token` | `GITHUB_TOKEN` or a `repo` scoped [Personal Access Token (PAT)](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token). | `GITHUB_TOKEN` |
| `committer` | The committer name and email address in the format `Display Name <email@address.com>`. Defaults to the GitHub Actions bot user. | `GitHub <noreply@github.com>` |
| `author` | The author name and email address in the format `Display Name <email@address.com>`. Defaults to the user who triggered the workflow run. | `${{ github.actor }} <${{ github.actor }}@users.noreply.github.com>` |
| `branch` | Name of the branch to merge the cherry pick. | `create-pull-request/patch` |
| `labels` | A comma or newline-separated list of labels. | |
| `assignees` | A comma or newline-separated list of assignees (GitHub usernames). | |
| `reviewers` | A comma or newline-separated list of reviewers (GitHub usernames) to request a review from. | |
| `team-reviewers` | A comma or newline-separated list of GitHub teams to request a review from. Note that a `repo` scoped [PAT](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) may be required. | |

## License

[MIT](LICENSE)
