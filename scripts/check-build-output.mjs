import fs from 'node:fs'

function check(name, path, tests) {
  const c = fs.readFileSync(path, 'utf8')
  const out = [`--- ${name} ---`]
  for (const [label, re] of tests) out.push(`  ${label}: ${re.test(c)}`)
  return out.join('\n')
}

const lines = []
lines.push(check('zh part-1/01', 'docs/.vitepress/dist/learn/part-1/01.html', [
  ['has 动手练 H2', /动手练/],
  ['has 去实践线 link', /\/learn\/practice\/part-1\/01/],
  ['has sec-5 anchor', /id="sec-5"/],
  ['has sec-1 anchor', /id="sec-1"/],
]))
lines.push(check('en practice part-1/01', 'docs/.vitepress/dist/en/learn/practice/part-1/01.html', [
  ['has Main Line', /Main Line/],
  ['has /en/learn/part-1/01', /\/en\/learn\/part-1\/01/],
  ['mis-points to zh /learn/part-1/01 (no en)', /href="\/learn\/part-1\/01"/],
  ['has sec-1 anchor', /id="sec-1"/],
  ['has sec-5 anchor', /id="sec-5"/],
]))
lines.push(check('zh prep part-pre/00', 'docs/.vitepress/dist/learn/part-pre/00.html', [
  ['has 接下来会用到 hook', /接下来会用到/],
  ['has 预备→主线/实践 line', /预备/],
  ['has sec-1 anchor', /id="sec-1"/],
]))
lines.push(check('zh intro part-0/01', 'docs/.vitepress/dist/learn/part-0/01.html', [
  ['has 体感一下 blockquote', /体感一下/],
  ['has sec-5 anchor', /id="sec-4"/],
]))
console.log(lines.join('\n'))
