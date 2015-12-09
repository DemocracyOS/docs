# DemocracyOS Documentation Site

Documentation template site for [DemocracyOS](https://github.com/DemocracyOS/app).

Content is taken from `/docs` directory in the [main](https://github.com/DemocracyOS/app) repo.

## How to start

Since this project uses a [git submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules), we recommend you to clone this repo recursively:
```
git clone git@github.com:DemocracyOS/docs.git --recursive
```

The run `npm install` to fetch all npm dependencies.

## Commands

`npm run build`: Converts `/app/docs/**/*.md` files to `.html` using `/assets` for templating and saves it to `/build` directory.

`npm run serve`: Local server for development.

`npm run deploy`: Builds the site and commits it to `gh-pages` branch. So, it will be visible on `http://docs.democracyos.org`
