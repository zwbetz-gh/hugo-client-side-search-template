# Hugo client-side search template

[![Netlify Status](https://api.netlify.com/api/v1/badges/bb28781b-4732-4e74-b3de-c5f27ac37d14/deploy-status)](https://app.netlify.com/sites/hugo-client-side-search-template/deploys)

A lightweight, fuzzy, client-side search template for Hugo.

## Links

- Demo: <https://hugo-client-side-search-template.netlify.app/>
- Forum: <https://discourse.gohugo.io/t/a-lightweight-fuzzy-client-side-search-template-for-hugo/39684>

## Dependencies

Just one, [Fuse.js](https://fusejs.io/), which allows fuzzy matching, among other cool things.

## How it Works

At a high-level:

1. A JSON index is generated by hugo during the site build
1. You navigate to the deployed site
1. The DOMContentLoaded event fires
1. The JSON index is fetched
1. Fuse.js is instantiated with the JSON index
1. You do a search which fires the keyup event
1. Fuse.js is queried for hits
1. Matched substrings are highlighted (with CSS that you craft)
1. The DOM is updated with hits (with HTML that you craft)

## Relevant Files

### config.yaml

The `outputs.home` config must be set to allow JSON.

### layouts/index.json.json

Iterate all regular pages. For each page, build a dict of relevant keys, then append the dict to a slice. jsonify the slice.

### layouts/partials/scripts.html

Get the JS resource, build it, then bundle it. Put this right before your closing `</body>` tag.

### layouts/partials/search.html

I chose to use the homepage as the search page, but you can use whatever page you want.

Just make sure the HTML elements in this partial are present.

### assets/js/fuse.mjs

I chose to keep the minified Fuse.js library in the repo.

You could also do it via `<script>` element, or `npm`. See the [Fuse.js installation docs](https://fusejs.io/getting-started/installation.html).

Regardless of installation method, you **must** use the `fuse.mjs` file, note the `.mjs` ext. See [#19](https://github.com/zwbetz-gh/hugo-client-side-search-template/issues/19).

### assets/js/types.ts

Update the `Page` interface with the relevant keys from your hugo site.

### assets/js/main.ts

Look for occurrences of `TEMPLATE_TODO` then follow the directions.

## Credit

Sample EVA data provided by <https://catalog.data.gov/dataset/extra-vehicular-activity-eva-us-and-russia>.

## Contributing

1. Create a branch from `main`, or a fork of this repo
1. Make your changes
1. Run the local dev server and confirm everything works

        hugo serve

1. Increment the [semantic version](https://docs.npmjs.com/about-semantic-versioning). `<semver>` should be one of: `major` | `minor` | `patch`

        npm --no-git-tag-version version <semver>

1. Update `CHANGELOG.md` with a new section
1. PR your changes to be reviewed and merged
