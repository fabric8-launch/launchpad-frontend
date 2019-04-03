#!/bin/bash
# Split on "/" to get last part of URL, ref: http://stackoverflow.com/a/5257398/689223
URL_SPLIT=(${CIRCLE_PULL_REQUEST//\// })
PR_NUM=$(printf %s\\n "${URL_SPLIT[@]:(-1)}")
# Domain names follow the RFC1123 spec [a-Z] [0-9] [-] limited to 253 characters
# https://en.wikipedia.org/wiki/Domain_Name_System#Domain_name_syntax
# So, just replace "/" or "." with "-"

DEPLOY_APP_SUBDOMAIN=`echo "$PR_NUM-pr-app-${CIRCLE_PROJECT_REPONAME}-${CIRCLE_PROJECT_USERNAME}" | tr '[\/|\.]' '-' | cut -c1-253`
DEPLOY_APP_DOMAIN="https://${DEPLOY_APP_SUBDOMAIN}.surge.sh"
ALREADY_DEPLOYED_APP=`yarn run surge list | grep ${DEPLOY_APP_DOMAIN}`

yarn app:build:mock-api

yarn run surge --project ./packages/launcher-app/build --domain ${DEPLOY_APP_DOMAIN};

if [ -z "$ALREADY_DEPLOYED" ]
then
  # Using the Issues api instead of the PR api
  # Done so because every PR is an issue, and the issues api allows to post general comments,
  # while the PR api requires that comments are made to specific files and specific commits
  GITHUB_PR_COMMENTS="https://api.github.com/repos/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/issues/${PR_NUM}/comments"
  echo "Adding github PR comment ${GITHUB_PR_COMMENTS}"
  curl -H "Authorization: token ${GH_PR_TOKEN}" --request POST ${GITHUB_PR_COMMENTS} --data '{"body":"Launcher Frontend preview: '${DEPLOY_APP_DOMAIN}'"}'
else
  echo "Already deployed ${DEPLOY_APP_DOMAIN}"
fi

DEPLOY_STORYBOOK_SUBDOMAIN=`echo "$PR_NUM-pr-storybook-${CIRCLE_PROJECT_REPONAME}-${CIRCLE_PROJECT_USERNAME}" | tr '[\/|\.]' '-' | cut -c1-253`
DEPLOY_STORYBOOK_DOMAIN="https://${DEPLOY_STORYBOOK_SUBDOMAIN}.surge.sh"
ALREADY_DEPLOYED_STORYBOOK=`yarn run surge list | grep ${DEPLOY_STORYBOOK_DOMAIN}`

yarn comp:storybook:build

yarn run surge --project ./packages/launcher-component/storybook-static --domain ${DEPLOY_STORYBOOK_DOMAIN};

if [ -z "$ALREADY_DEPLOYED_STORYBOOK" ]
then
  # Using the Issues api instead of the PR api
  # Done so because every PR is an issue, and the issues api allows to post general comments,
  # while the PR api requires that comments are made to specific files and specific commits
  GITHUB_PR_COMMENTS="https://api.github.com/repos/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/issues/${PR_NUM}/comments"
  echo "Adding github PR comment ${GITHUB_PR_COMMENTS}"
  curl -H "Authorization: token ${GH_PR_TOKEN}" --request POST ${GITHUB_PR_COMMENTS} --data '{"body":"Storybook preview: '${DEPLOY_STORYBOOK_DOMAIN}'"}'
else
  echo "Already deployed ${DEPLOY_STORYBOOK_DOMAIN}"
fi
