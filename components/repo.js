const fs = require('fs');
const path = require('path');
const Git = require('nodegit');

function areOptionsValid(options) {
  return (
    options &&
    options.remoteUrl &&
    options.localDir &&
    options.branch &&
    options.credentials &&
    options.credentials.username &&
    options.credentials.passphrase
  );
}

function clone(cb) {
  this.busy = true;

  console.log('Trying to clone repo');

  Git.Clone(this.options.remoteUrl, this.options.localDir, this.cloneOptions)
    .then((repo) => {
      if (repo instanceof Git.Repository) {
        console.log('Succesfully cloned!');
        cb(null);
      } else {
        cb('Failed to clone the repo');
      }
    })
    .catch((err) => {
      console.error(err);
      this.busy = false;
      cb(err);
    });
}

function pull(cb) {
  console.log('Trying to pull the repo');
  this.busy = true;
  let repository;
  Git.Repository.open(this.options.localDir)
    .then((_repository) => {
      console.log('Opened the repo');
      repository = _repository;
      return repository.fetch('origin', this.cloneOptions.fetchOpts);
    })
    .then(() => {
      console.log('Fetched origin');
      return repository.getBranch(`refs/remotes/origin/${this.options.branch}`);
    })
    .then((reference) => {
      console.log('Got branch', this.options.branch);
      return repository.checkoutRef(reference, {
        checkoutStrategy: Git.Checkout.STRATEGY.FORCE,
      });
    })
    .then((oid) => {
      console.log('Force checkout to origin/', this.options.branch);
      this.busy = false;
      cb(null, oid);
    })
    .catch((err) => {
      this.busy = false;
      cb(err);
    });
}

function Repo(options) {
  if (!areOptionsValid(options)) {
    console.error('Repo options are not valid');
    process.exit();
  } else {
    this.options = options;

    this.alreadyCloned = fs.existsSync(path.join(options.localDir, '.git'));

    this.cloneOptions = {
      fetchOpts: {
        callbacks: {
          certificateCheck() {
            return 1;
          },
          credentials: () =>
            Git.Cred.userpassPlaintextNew(
              this.options.credentials.username,
              this.options.credentials.passphrase,
            ),
        },
      },
    };
  }
}

Repo.prototype.clone = clone;
Repo.prototype.pull = pull;

module.exports = Repo;
