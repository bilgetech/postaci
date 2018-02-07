# PostaCI
PostaCI is a simple tool that allows you to version your [postman](https://www.getpostman.com/) tests, execute them regularly and see results as badges like these:

![](https://img.shields.io/badge/sample-badge-green.svg)

![](https://img.shields.io/badge/all%20passing-34/34-green.svg)

![](https://img.shields.io/badge/some%20failing-40/42-orange.svg)

## Features

### Git Support
PostaCI will fetch your postman collections from the git repositories you provide. It can clone and pull the repositories to the directories you provide. PostaCI uses [nodegit](https://github.com/nodegit/nodegit) to make git operations.

### Multiple Collections & Boxes
PostaCI, with the help of [newman](https://github.com/postmanlabs/newman), can run multiple postman collections. PostaCI lets you configure environment, global and data variables. Keep reading for further information.

### Badges
PostaCI generate badges with the help of [badges](https://github.com/badges/shields) library. You can use this badges in your repository.

### Scheduling
You can schedule your test runs in a cron-like manner. It uses [node-schedule](https://github.com/node-schedule/node-schedule) to trigger test runs.

### Webhooks
PostaCI provides a simple web server and lets you trigger runs, get results of runs and pull the git repository. So you can use github webhooks, post-release scripts, etc to create a simple continous integration flow.

We, in [Bilgetech](http://www.bilgetech.com.tr) use this feature to refresh the test collections after tests are updated and re-run the tests after a new version of the tested project is published.


## What does postacı mean?

The word postacı [postadʒɯ] is the Turkish word for a postman. If you have hard time reading phonetic alphabet, you can call it post-uh-gee or post-uh-c-i.
