#!/bin/bash

GITLAB_TOKEN=$1
PROJECT_ID=$2
BRANCH_NAME=$3

if [ -s "CHANGELOG.md" ]
then
	echo "Changelog exists and is not empty"
else
	echo "Changelog does not exist or is empty. Wiki will not be updated."
	exit 0
fi

echo "Checking if wiki page currently exists for this branch"
RESPONSE="$(curl --write-out '%{http_code}' -s --output /dev/null --header "PRIVATE-TOKEN: ${GITLAB_TOKEN}" "https://gitlab.fii-corp.com/api/v4/projects/${PROJECT_ID}/wikis/Releases%2F${BRANCH_NAME}ReleaseNotes")"

echo $RESPONSE

if [ $RESPONSE = "404" ]
then
	echo "Page was not found. Adding new page."
	curl --data "format=markdown&title=Releases%2F${BRANCH_NAME}ReleaseNotes&content=$(cat CHANGELOG.md)" --header "PRIVATE-TOKEN: ${GITLAB_TOKEN}" "https://gitlab.fii-corp.com/api/v4/projects/${PROJECT_ID}/wikis"
else
	echo "Page was found. Adding new changelog to end of page."
	RESPONSE="$(curl -s  --header "PRIVATE-TOKEN: ${GITLAB_TOKEN}" "https://gitlab.fii-corp.com/api/v4/projects/${PROJECT_ID}/wikis/Releases%2F${BRANCH_NAME}ReleaseNotes")"
	PAGE_CONTENT=$(jq -r ".content" <(echo "$RESPONSE"))
	NEW_CONTENT="$(cat CHANGELOG.md)"
	NEW_PAGE_CONTENT="${NEW_CONTENT}"$'\n'"${PAGE_CONTENT}"
	curl --request PUT --data "format=markdown&title=${BRANCH_NAME}ReleaseNotes&content=${NEW_PAGE_CONTENT}" --header "PRIVATE-TOKEN: ${GITLAB_TOKEN}" "https://gitlab.fii-corp.com/api/v4/projects/${PROJECT_ID}/wikis/Releases%2F${BRANCH_NAME}ReleaseNotes"
fi
