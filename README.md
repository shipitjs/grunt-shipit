# shipit

Deployment tool written in JavaScript.

## Install

```sh
npm install -g shipit
```

## Usage

```
shipit <stage> <tasks ...>
```

## Workflow tasks

- deploy
  - deploy:fetch
    - Create workspace.
    - Fetch repository.
    - Checkout commit-ish.
    - Emit event "fetched".
  - deploy:update
    - Create and define release path.
    - Remote copy project.
    - Emit event "updated".
  - deploy:publish
    - Update synonym link.
    - Emit event "published".
  - deploy:clean
    - Remove old releases.
    - Emit event "cleaned".
- rollback
  - rollback:init
    - Define release path.
    - Emit event "rollback".
  - deploy:publish
    - Update synonym link.
    - Emit event "published".
  - deploy:clean
    - Remove old releases.
    - Emit event "cleaned".