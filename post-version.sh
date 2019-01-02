# Get version from package.json
PACKAGE_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')

# Change dependency version on the footer component
perl -pi -e "s/> — v(.*)/> — v$PACKAGE_VERSION/" ./examples/shared/src/components/footer/Footer.tsx

# Remove default tag from npm version and recreate one without the v prefix
git tag -d v$PACKAGE_VERSION
git tag $PACKAGE_VERSION

# Add unstaged files and commit
git add .
git commit --amend --no-edit
