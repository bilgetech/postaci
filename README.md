# PostaCI

| | | 
|-|-|
| ![postaci](https://user-images.githubusercontent.com/4990386/35919965-89ccc314-0c27-11e8-83bd-d5e143e91793.png) | PostaCI is a simple continous integration tool to run [postman](https://www.getpostman.com) tests through http requests, schedule the test runs and and see the results as badges like these: <br /><br /> ![](https://img.shields.io/badge/all%20passing-34/34-green.svg) ![](https://img.shields.io/badge/some%20failing-40/42-orange.svg) ![](https://img.shields.io/badge/error-has%20errors-red.svg)

## Installation

```
$ npm install -g postaci
```

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

## Usage

This library is intended to be used as a cli. Currently we don't support programmatic usage as a module.

```
$ postaci -c config.json
```

To get started with PostaCI, you need to do the following:

1. Prepare one config file defining your box entries
2. Prepare your folder structure for each box and put .postacirc file into it.

## Endpoints

#### `GET/POST /refresh/:box-address`
Clones or pulls the box. Or queues a refresh order if the box is currently refreshing or running. After the pull operation completed, runs all of the runnables inside of the box.

#### `GET/POST /run/:box-address`
Runs all of the runnables inside of the box. Or queues a run command if the box is currently refreshing or running.

#### `GET /badge/:box-address/:runnable-name`
Returns the svg badge for the given runnable. All of the options are listed here:

- ![](https://img.shields.io/badge/tests-running...-yellow.svg)
- ![](https://img.shields.io/badge/all%20passing-50/50-green.svg)
- ![](https://img.shields.io/badge/some%20failing-49/50-orange.svg)
- ![](https://img.shields.io/badge/error-has%20errors-red.svg)
- ![](https://img.shields.io/badge/error-fatal%20error-red.svg)
- ![](https://img.shields.io/badge/box-not%20found-lightgrey.svg)
- ![](https://img.shields.io/badge/runnable-not%20found-lightgrey.svg)
- ![](https://img.shields.io/badge/runnable-not%20ready-lightgrey.svg)

#### `GET /summary/:box-address/:runnable-name`
Returns the json summary of the run. This json is directly pipelined from newman's json reporter.

## Concepts

### Box
A box is a representation of your test collections which are living in the same repository. Each box can have multiple runnables and must have a .postacirc file in which you define all of your runnables.

### Runnable
A runnable is the sum of one collection file and the necessary files such as environment variables, global variables, data variables etc. Runnables can share files but may have side effects, so be careful about that.

![box-folder-structure](https://user-images.githubusercontent.com/4990386/35972761-27fdd732-0ce4-11e8-944a-cb5342cca28c.png)

### .postacirc

This file must be created and placed into the root of the each box. It should not be .gitignored.

You can use the [sample.postacirc](/sample.postacirc) renaming it to .postacirc modifing it to suit your needs.

The .postacirc file is a json object with the following structure.

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| runnables | array | Configuration of each runnable | Required
| runnables[].name | string | A name to identify runnable. It should be **unique** among the runnables of a box. | Required |
| runnables[].collection | string | Path to the collection file relative to the box root. | Required |
| runnables[].environment | string | Path to the environment variables file relative to the box root. | Optional |
| runnables[].globals | string | Path to the global variables file relative to the box root. | Optional |
| runnables[].iterationData | string | Path to the data variables file relative to the box root. | Optional |
| runnables[].iterationCount | number | Number of iterations. | Optional |

### config.json

config.json is the file you put all of the necessary information. You should not add this file to repository since it has credential information and environment specific settings.

You can use the [config-sample.json](/config-sample.json) modifying it to suit your needs.

| Field | Type | Description | Required |
| ----- | ---- | ----------- | -------- |
| boxes | array | Configuration of each box | Required
| boxes[].address | string | A name to identify box. It should be **unique** among the boxes in the configuration file. | Required |
| boxes[].gitConfig | object | Settings of the git repo of the box. | Required |
| boxes[].gitConfig.remoteUrl | string | Remote url of your git repo. | Required |
| boxes[].gitConfig.localDir | string | The directory of your box. **It will be used to clone your box folder.** | Required |
| boxes[].gitConfig.branch | string | The branch that will used to checkout and run the tests. | Required |
| boxes[].gitConfig.credentials | object | Your git credentials that will be used to clone and pull. | Required |
| boxes[].gitConfig.credentials.username | string | Your git username. | Required |
| boxes[].gitConfig.credentials.passphrase | string | Your git password. | Required |
| boxes[].injectAssets | number | The information to be used to inject assets variable. | Optional |
| boxes[].injectAssets.key | number | The key of assets variable | Required if injectAssets exists. |
| boxes[].injectAssets.value | number | The relative filepath of the root of your assets. | Required if injectAssets exists. |
| boxes[].scheduleConfig | string | Cron-like configuration. See [node-schedule](https://github.com/node-schedule/node-schedule#cron-style-scheduling) | Optional |

### Assets Injection
One thing problematic with postman tests is file uploads. You can select the file from the UI but, if you export the collection the output cannot be directly run by newman since the files you try to upload is not defined.

We try to address this problem by manually adding file paths to the exported collection file. See the example below:

```
"body": {
	"mode": "formdata",
	"formdata": [
		{
			"key": "file",
			"description": "",
			"type": "file",
			"src": "{{ASSETS}}/user.jpg" // <------- MANUALLY ADD SRC ENTRY
		}
	]
},
```

See [sample-file-upload-test.json](sample-file-upload-test.json) for the whole item.

If injectAssets is enabled in the configuration, PostaCI will add or replace assets key and value and make newman find the files in your machine.

## Ideal Work Flow

#### One Time Setup:
1. Set up a webhook to http://your-server.com:3000/refresh/box-name so in every push to master will trigger a pull and run.
2. Set up your publish script or manually trigger http://your-server.com:3000/run/box-name after each release of the code being tested by your Postman tests.

#### Every Time You Add or Update Tests:
1. Develop your tests in Postman.
2. Export collections, environments, globals and data files to the relevant place in your box folder.
3. Manually edit collection files to add src fields if you want to inject assets and do file upload tests.
4. Commit your changes and push it to master.
5. After a while, your badges are ready

## Caveats
PostaCI is in its alpha state, so expect malfunctions, instability and lot's of short-comings. Some of the stupid restriction of the current version is the following:

- Assets Injection works only if you have globals file.
- Clone and pull functions work only if repo accepts username/passphrase authentication. This also means you cannot use PostaCI with public repos for now.
- Since PostaCI depends on libgit2, in the environment you install PostaCI, there should be make and gcc.
- All of the boxes and runnables are being run in parallel, this is a good thing if you prefer, but it's not configurable right now.
- PostaCI server runs on port 3000 and it's not configurable yet.
- Runnables inside of a box cannot be run independently. You always have to run the entire box for now :/
- When you start PostaCI it automatically clone repos and run tests. This not configurable right now.


## What does postacı mean?

The word postacı `/postadʒɯ/` is the Turkish word for a postman. If you have hard time reading phonetic alphabet, you can call it post-uh-gee or post-uh-c-i.

## Contributing

All kind of contribution is welcomed :)

## License

License information can be found in [LICENSE](/LICENSE)
