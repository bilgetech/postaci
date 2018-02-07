# Postacı
Postacı is a simple tool that allows you to version your postman tests, execute them regularly and see results as badges like this:

![](https://img.shields.io/badge/sample-badge-green.svg)

## Features

### Git Support
Postacı will fetch your postman collections from the git repositories you provide. It can clone and pull the repositories to the directories you provide. Postacı uses [nodegit](https://github.com/nodegit/nodegit) to make git operations.

### Multiple Collections & Boxes
Postacı, with the help of [newman](https://github.com/postmanlabs/newman), can run multiple postman collections. Postacı lets you configure environment, global and data variables. Keep reading for further information.

### Badges
Postacı generate badges with the help of [badges](https://github.com/badges/shields) library. You can use this badges in your repository.

### Scheduling
You can schedule your test runs in a cron-like manner. It uses [node-schedule](https://github.com/node-schedule/node-schedule) to trigger test runs.

### Webhooks
Postacı provides a simple web server and lets you trigger runs, get results of runs and pull the git repository. So you can use github webhooks, post-release scripts, etc to create a simple continous integration flow.

We, in [Bilgetech](http://www.bilgetech.com.tr) use this feature to refresh the test collections after tests are updated and re-run the tests after a new version of the tested project is published.


## What does postacı mean?

The word postacı [postadʒɯ] is the Turkish word for a postman. If you have hard time reading phonetic alphabet, you can call it post-uh-gee :)

