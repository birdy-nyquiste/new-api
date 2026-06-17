import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8')
}

function assertIncludes(file, content, expected) {
  if (!content.includes(expected)) {
    throw new Error(`${file} is missing expected content: ${expected}`)
  }
}

function assertExcludes(file, content, unexpected) {
  if (content.includes(unexpected)) {
    throw new Error(`${file} still contains removed content: ${unexpected}`)
  }
}

const homeIndexFile = 'src/features/home/index.tsx'
const homeIndex = read(homeIndexFile)

for (const section of [
  'CustomConfiguration',
  'SimConnectivity',
  'AudienceUseCases',
  'HomeFAQ',
]) {
  assertIncludes(homeIndexFile, homeIndex, section)
}

assertExcludes(homeIndexFile, homeIndex, 'PricingTeaser')

const heroFile = 'src/features/home/components/sections/hero.tsx'
const hero = read(heroFile)
assertIncludes(heroFile, hero, 'Nyquiste Global AI Suite')
assertIncludes(heroFile, hero, 'Use top global AI without the setup work')

const sectionFiles = [
  'src/features/home/components/sections/custom-configuration.tsx',
  'src/features/home/components/sections/sim-connectivity.tsx',
  'src/features/home/components/sections/audience-use-cases.tsx',
  'src/features/home/components/sections/home-faq.tsx',
]

for (const file of sectionFiles) {
  const content = read(file)
  assertIncludes(file, content, 'useTranslation')
  assertIncludes(file, content, 'font-landing')
}

const zh = JSON.parse(read('src/i18n/locales/zh.json')).translation
const requiredZh = {
  'Nyquiste Global AI Suite': 'Nyquiste 全球 AI 全家桶',
  'Use top global AI without the setup work': '不用折腾，也能用上全球顶级 AI',
  'Configured around your actual needs': '按你的实际需求配置',
  'Stable connection when global AI needs it': '需要稳定连接时，也一起配好',
}

for (const [key, value] of Object.entries(requiredZh)) {
  if (zh[key] !== value) {
    throw new Error(`zh locale mismatch for ${key}: expected ${value}`)
  }
}

console.log('Homepage restructure checks passed')
