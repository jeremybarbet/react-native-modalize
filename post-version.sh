# Get version from package.json
PACKAGE_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')

# Change dependency version on the header component
perl -pi -e "s/— v(.*)/— v$PACKAGE_VERSION/" ./examples/expo/src/components/header/Header.js
perl -pi -e "s/— v(.*)/— v$PACKAGE_VERSION/" ./examples/react-navigation/src/components/header/Header.js
perl -pi -e "s/— v(.*)/— v$PACKAGE_VERSION/" ./examples/react-native-navigation/src/components/header/Header.js

# Remove default tag from npm version
git tag -d v$PACKAGE_VERSION

# Add unstaged files and commit
git add .
git commit --amend --no-edit
git tag $PACKAGE_VERSION
