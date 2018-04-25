const fs = require('fs');
const path = require('path');
const newman = require('newman');
const badge = require('gh-badges');
const Repo = require('./repo');

function generateBadge(runnable) {
  const format = { template: 'flat' };
  if (runnable.err) {
    format.text = ['error', 'fatal error'];
    format.colorscheme = 'red';
  } else if (runnable.summary.error) {
    format.text = ['error', 'has errors'];
    format.colorscheme = 'red';
  } else {
    const total = runnable.summary.run.stats.assertions.total;
    const failed = runnable.summary.run.stats.assertions.failed;
    const success = total - failed;

    if (failed === 0) {
      format.text = ['all passing', `${success}/${total}`];
      format.colorscheme = 'green';
    } else {
      format.text = ['some failed', `${success}/${total}`];
      format.colorscheme = 'orange';
    }
  }

  console.log(runnable.name, '\t\t\t', 'Generating badge');
  badge(format, (svg, err) => {
    if (err) {
      console.error(err);
    }
    runnable.badge = svg;
    console.log(runnable.name, '\t\t\t', 'Generated badge');
  });
}

function generateAllBadges() {
  this.postacirc.runnables.forEach((runnable) => {
    generateBadge(runnable);
  });
}

function readPostacirc(localDir) {
  const contents = fs.readFileSync(path.join(localDir, '.postacirc'));
  return JSON.parse(contents);
}

function readGlobals(globalsPath) {
  console.log('Reading globals');
  const contents = fs.readFileSync(globalsPath);
  return JSON.parse(contents);
}

function writeToGlobals(globalsPath, globals) {
  console.log('Writing to globals');
  const contents = JSON.stringify(globals);
  fs.writeFileSync(globalsPath, contents);
}

function updateGlobalEntry(globalsPath, key, value) {
  const globals = readGlobals(globalsPath);

  const assetItem = globals.values.find(item => item.key === key);
  if (assetItem) {
    assetItem.value = value;
  } else {
    globals.values.push({
      enabled: true,
      key,
      value,
      type: 'text',
    });
  }

  writeToGlobals(globalsPath, globals);
}

function runSingle(runnable, done) {
  newman
    .run(
      {
        collection: runnable.collection,
        iterationData: runnable.iterationData,
        environment: runnable.environment,
        globals: runnable.globals,
        iterationCount: runnable.iterationCount,
        timeoutRequest: 10000,
        timeoutScript: 15000,
        insecure: true,
        reporters: ['cli'],
        reporter: {
          cli: {
            silent: false,
            noSummary: false,
            noFailures: true,
            noAssertions: true,
            noSuccessAssertions: true,
            noConsole: false,
          },
        },
        color: true,
        noColor: false,
      },
      (err) => {
        if (err) {
          console.error(runnable.name, '\t\t\t', 'Cannot start this runnable. See error.');
          console.error(JSON.stringify(err));
          runnable.summary = { message: 'Cannot start this runnable. See error.', error: err };
          runnable.err = err;
          done(err);
        }
      },
    )
    .on('start', () => {
      // on start of run, log to console
      console.log(runnable.name, '\t\t\t', 'Collection run started!');
    })
    .on('beforeItem', (err, args) => {
      if (err) {
        console.error(err);
      } else {
        console.log(runnable.name, '\t\t\t', args.item.name);
      }
    })
    .on('exception', (cursor, args) => {
      console.error(runnable.name);
    })
    .on('done', (err, summary) => {
      runnable.summary = summary;
      runnable.err = err;
      console.log(`--------------- DONE RUNNING: ${runnable.name} ---------------`);
      done();
    });
}

function run() {
  if (this.isRunning) {
    this.runQueued = true;
  } else {
    this.isRunning = true;

    let completed = 0;
    this.postacirc.runnables.forEach((runnable) => {
      runSingle(runnable, (err) => {
        completed += 1;
        this.generateBadge(runnable);
        if (completed === this.postacirc.runnables.length) {
          console.log(this.address, '\t\t\t', 'Box run completed');
          this.isRunning = false;
          if (this.refreshQueued) {
            console.log(this.address, '\t\t\t', 'There is a refresh queued');
            this.refreshQueued = false;
            this.refreshAndRun();
          } else if (this.runQueued) {
            console.log(this.address, '\t\t\t', 'There is a run queued');
            this.runQueued = false;
            this.run();
          }
        }
      });
    });
  }
}

function afterRefresh() {
  if (this.injectAssets) {
    console.log('Injecting assets global key');
    const localDir = this.repo.options.localDir;
    this.postacirc = readPostacirc(localDir);

    this.postacirc.runnables.forEach((runnable) => {
      const key = this.injectAssets.key;
      const value = `${localDir}/${this.injectAssets.value}`;

      runnable.collection = runnable.collection ? path.join(localDir, runnable.collection) : null;

      runnable.iterationData = runnable.iterationData
        ? path.join(localDir, runnable.iterationData)
        : null;

      runnable.environment = runnable.environment
        ? path.join(localDir, runnable.environment)
        : null;

      runnable.globals = runnable.globals ? path.join(localDir, runnable.globals) : null;

      try {
        updateGlobalEntry(runnable.globals, key, value);
      } catch (ex) {
        runnable.err = {
          message: 'Cannot update global entry',
          error: ex,
          help: 'Can you check your global variable file path or contents?',
        };
      }
    });
  }

  console.log(this.address, '\t\t\t', 'Box refresh completed.');

  if (this.refreshQueued) {
    this.refreshQueued = false;
    console.log(
      this.address,
      '\t\t\t',
      'There is an awaiting refresh command. Restarting refresh process.',
    );
    this.refreshAndRun();
  } else {
    console.log(this.address, '\t\t\t', 'Running the runnables in the box.');
    this.run();
  }
}

function refreshAndRun(cb) {
  if (this.repo.busy || this.isRunning) {
    this.refreshQueued = true;
  } else if (this.repo.alreadyCloned) {
    this.repo.pull((err) => {
      if (err) {
        cb(err);
      } else {
        afterRefresh.bind(this)(cb);
      }
    });
  } else {
    this.repo.clone((err) => {
      if (err) {
        cb(err);
      } else {
        afterRefresh.bind(this)(cb);
      }
    });
  }
}

function getRunnableByName(name) {
  if (!this.postacirc || !this.postacirc.runnables) return null;
  return this.postacirc.runnables.find(item => item.name === name);
}

function Box(opts) {
  this.address = opts.address;
  this.repo = new Repo(opts.gitConfig);
  this.injectAssets = opts.injectAssets;
}

Box.prototype.refreshAndRun = refreshAndRun;
Box.prototype.run = run;
Box.prototype.generateAllBadges = generateAllBadges;
Box.prototype.generateBadge = generateBadge;
Box.prototype.getRunnableByName = getRunnableByName;

module.exports = Box;
