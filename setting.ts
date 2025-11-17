import Env from './next.config.js'
const isProd = process.env.NODE_ENV === 'production'

export default {
  isProd,
  basePath: Env.basePath,
  apiPath: isProd ? '' : 'http://localhost:8000',
  title: '😴 正規分布可視化ツール 😴',
  description: '正規分布の可視化ツールです！ 😴😴😴',
  keywords: []
}
