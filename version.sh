PACKAGE_VERSION=$(cat package.json | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')
perl -pi -e "s/> — v(.*)</> — v$PACKAGE_VERSION</" ./example/App.tsx
