## Description
This plugin provides a brand portal web application developed with vue.js

## Important Note

**These features are not part of the Nuxeo Production platform.**

These solutions are provided for inspiration and we encourage customers to use them as code samples and learning resources.

This is a moving project (no API maintenance, no deprecation process, etc.) If any of these solutions are found to be useful for the Nuxeo Platform in general, they will be integrated directly into platform, not maintained here.

## Requirements
Building requires the following software:
- git
- maven
- node & npm

## How to build
```
git clone https://github.com/nuxeo-sandbox/nuxeo-dam-catalog-portal
cd nuxeo-dam-catalog-portal
mvn clean install
```

## Deploying
* Install the marketplace package from the admin center or using nuxeoctl

## Development

```
cd nuxeo-dam-catalog-portal-web
```

Install dependencies if necessary:

```
npm install
```

create a .env.local file and set the following variables

```
DEV_SERVER_URL=http(s)://<servername>
DEV_SERVER_CRED=<Basic Auth Header Value>  (ex: Basic QWRtaW5pc3RyYXRvcjpBZG1pbmlzdHJhdG9y)
```

Run the app locally

```
npm run serve
```

## Known limitations
This plugin is a work in progress.

## About Nuxeo
Nuxeo dramatically improves how content-based applications are built, managed and deployed, making customers more agile, innovative and successful. Nuxeo provides a next generation, enterprise ready platform for building traditional and cutting-edge content oriented applications. More information is available at [www.nuxeo.com](http://www.nuxeo.com).
