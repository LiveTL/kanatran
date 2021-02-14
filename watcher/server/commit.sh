#!/bin/bash

echo Committing to $1
cd ../baquap
pwd
git add .
git commit --amend -m "Updated transcripts" --date="now"
git commit -m "Created transcripts"
git push --set-upstream origin $1 -f

exit 0