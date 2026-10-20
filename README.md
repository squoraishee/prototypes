# Prototypes

The Daily Coefficient's prototypes: simulations, games and experiments, one folder per prototype. Each folder's name is its slug, and the site serves it at `thedailycoefficient.com/<slug>/`.

Each folder holds the page (`index.html`), a README, the recording (`demo.gif`, `demo.mp4`) and the data scripts. Add a new prototype as a new folder here, and list it in `assets/site.js` in the site repo (squoraishee/daily-coefficient) with `kind: "prototype"`.

Stories live in their own repo, squoraishee/stories. A prototype only goes on the site once it is listed in `site.js`.

## How it gets published

Pushing to `main` runs `.github/workflows/sync.yml`. It copies this repo to the private copy on the thedailycoefficient account, then asks the site repo to rebuild. The site repo's deploy takes every slug listed in `site.js` from here or from the stories repo, and publishes only the served files.

The workflow needs two secrets: `DEPLOY_TOKEN` (from thedailycoefficient, Contents read and write on the copy) and `SITE_TOKEN` (from squoraishee, Contents read and write on daily-coefficient, stories and prototypes).
