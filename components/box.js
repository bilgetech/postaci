const fs = require('fs');
const path = require('path');
const newman = require('newman');
const Repo = require('./repo');

function readPostacirc() {
  if (!this.gitConfig) return false;

  const contents = fs.readFileSync(path.join(this.gitConfig.localDir, '.postacirc'));
  return JSON.parse(contents);
}

function run(cb) {
  if (!this.repo.alreadyCloned) {
    cb('Repo is not cloned yet');
    return;
  }

  this.isRunning = true;

  const postacirc = readPostacirc();

  newman
    .run({
      collection: postacirc.collection,
      iterationData: postacirc.iterationData,
      environment: postacirc.environment,
      globals: postacirc.globals,
      iterationCount: postacirc.iterationCount,
    })
    .on('start', (err, args) => {
      // on start of run, log to console
      console.log('running a collection...');
    })
    .on('done', (err, summary) => {
      this.isRunning = false;
      if (err || summary.error) {
        this.error = err || summary.error;
        console.error('collection run encountered an error.');
        cb(err, summary.error);
      } else {
        console.log('collection run completed.');
        cb(null, summary);
      }
    });
}

function refresh(cb) {
  if (this.repo.busy) {
    cb('Repo is currently busy');
    return;
  }

  if (this.repo.alreadyCloned) {
    this.repo.pull(cb);
  } else {
    this.repo.clone(cb);
  }
}

function Box(address, gitConfig) {
  this.address = address;
  this.repo = new Repo(gitConfig);
}

Box.prototype.refresh = refresh;
Box.prototype.run = run;

module.exports = Box;
