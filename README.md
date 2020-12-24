Directory Scrapper
----

[![Build Status](https://travis-ci.org/garciadiazjaime/scrapper-directory.svg)](https://travis-ci.org/garciadiazjaime/scrapper-directory)

Run project:
----
a) let's install all packages:

`npm install`
`bower install`

b) let's run the server

`npm run webpack`
`npm run dev`

c) cron to get places form google maps

`npm run webpack-cron`
`npm run cron-maps -- -t restaurant -s nearby`

d) cront to get images from google images

`npm run webpack-cron-image`
`npm run cron-image`

e) cront to get meta data (description) from google search

`npm run webpack-cron-description`
`npm run cron-description`

By default server will run on http://127.0.0.1:3030/


Code to increase jslint max line length limit
/* eslint max-len: [2, 500, 4] */

Deploy project
`npm run update`
`git status`
`git diff`
`npm run deploy`

Login rch
setup -l setup email

Remove Cartridge
http://stackoverflow.com/questions/31323791/how-do-you-delete-a-database-cartridge-on-an-openshift-app

Setting up Envs
rhc env set -a app DB_NAME=value
rhc env set -a app DB_USER=value
rhc env set -a app DB_PASSWORD=value
rhc env set -a app DJANGO_SETTINGS_MODULE=settings.prod
rhc env set -a app SENDGRID_API_KEY=value
rhc env set -a app NPM_CONFIG_PRODUCTION=true

Checking Envs
rhc env list -a app

https://developers.google.com/places/web-service/search

/* eslint max-len: [2, 500, 4] */


`npm run cron-maps -- -t restaurant -s nearby`



##Google Places API Web Service
https://developers.google.com/places/web-service/
