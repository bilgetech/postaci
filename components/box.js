const fs = require('fs');
const path = require('path');
const newman = require('newman');
const Repo = require('./repo');

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

function runSingle(runnable, done) {
  newman
    .run({
      collection: runnable.collection,
      iterationData: runnable.iterationData,
      environment: runnable.environment,
      globals: runnable.globals,
      iterationCount: runnable.iterationCount,
    })
    .on('start', (err, args) => {
      // on start of run, log to console
      console.log('Collection run started!');
    })
    .on('beforeItem', (err, args) => {
      if (err) {
        console.error(err);
      } else {
        console.log(args.item.name);
      }
    })
    .on('done', (err, summary) => {
      runnable.summary = summary;
      runnable.err = err;
      done();
    });
}

function run(cb) {
  if (!this.repo.alreadyCloned) {
    cb('Repo is not cloned yet');
    return;
  }

  this.isRunning = true;

  let completed = 0;

  this.postacirc.runnables.forEach((runnable) => {
    runSingle(runnable, () => {
      completed += 1;
      if (completed === this.postacirc.runnables.length) {
        this.isRunning = false;
        cb(null);
      }
    });
  });
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

function afterRefresh(cb) {
  if (this.injectAssets) {
    console.log('Injecting assets global key');
    const localDir = this.repo.options.localDir;
    this.postacirc = readPostacirc(localDir);

    this.postacirc.runnables.forEach((runnable) => {
      const key = this.injectAssets.key;
      const value = `${localDir}/${this.injectAssets.value}`;

      runnable.collection = runnable.collection
        ? path.join(localDir, runnable.collection)
        : null;

      runnable.iterationData = runnable.iterationData
        ? path.join(localDir, runnable.iterationData)
        : null;

      runnable.environment = runnable.environment
        ? path.join(localDir, runnable.environment)
        : null;

      runnable.globals = runnable.globals
        ? path.join(localDir, runnable.globals)
        : null;

      updateGlobalEntry(runnable.globals, key, value);
    });

    cb(null);
  } else {
    cb(null);
  }
}

function refresh(cb) {
  if (this.repo.busy) {
    cb('Repo is currently busy');
    return;
  }

  if (this.repo.alreadyCloned) {
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

function Box(opts) {
  this.address = opts.address;
  this.repo = new Repo(opts.gitConfig);
  this.injectAssets = opts.injectAssets;
}

Box.prototype.refresh = refresh;
Box.prototype.run = run;

module.exports = Box;
