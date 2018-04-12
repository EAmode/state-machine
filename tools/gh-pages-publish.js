const { readFileSync } = require('fs')
const { cd, echo, exec, touch } = require('shelljs')
const url = require('url')

let repoUrl
const pkg = JSON.parse(readFileSync('package.json'))
if (typeof pkg.repository === 'object') {
  if (!pkg.repository.hasOwnProperty('url')) {
    throw new Error('URL does not exist in repository section')
  }
  repoUrl = pkg.repository.url
} else {
  repoUrl = pkg.repository
}

const parsedUrl = url.parse(repoUrl)
const repository = (parsedUrl.host || '') + (parsedUrl.path || '')
const ghToken = process.env.GH_TOKEN

echo('Deploying docs!!!')
cd('dist/docs')
touch('.nojekyll')
exec('git init')
exec('git add .')
exec('git config user.name "Sebastian Kropp"')
exec('git config user.email "sebastian@kropponline.de"')
exec('git commit -m "docs(docs): update gh-pages"')
exec(`git push --force --quiet "https://${ghToken}@${repository}" master:gh-pages`)
echo('Docs deployed!!')
