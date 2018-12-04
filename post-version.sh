PACKAGE_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')
git tag -d v$PACKAGE_VERSION
git tag $PACKAGE_VERSION
git add .
git commit --amend
