# DemocracyOS Documentation Site

Documentation template site for [DemocracyOS](https://github.com/DemocracyOS/app).

Content is taken from `/docs` directory in the [main](https://github.com/DemocracyOS/app) repo.

## How to start

Since this project uses a [git submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules), we recommend you to clone this repo recursively:
```
git clone git@github.com:DemocracyOS/docs.git --recursive
```

Then run `npm install` to fetch all npm dependencies.

## Getting new docs

When [DemocracyOS](https://github.com/DemocracyOS/app) documentation is updated, to pull those changes you have to: 

- On this directory, `cd` into `app` directory
- Run `git pull origin master`
- `cd` back to the root directory of this repository
- Add the changes and commit them to the `master` branch
- After that, run `npm run deploy` to see those changes in the online site.

## Commands

`npm run build`: Converts `/app/docs/**/*.md` files to `.html` using `/assets` for templating and saves it to `/build` directory.

`npm run serve`: Local server for development.

`npm run deploy`: Builds the site and commits it to `gh-pages` branch. So, it will be visible on `http://docs.democracyos.org`
