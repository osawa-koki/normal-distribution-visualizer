'use client'

import React, { useEffect, useRef } from 'react'
import { Container, Card } from 'react-bootstrap'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const SCROLL_OFFSET = 100
const HIGHLIGHT_BACKGROUND = '#fffbcc'
const DEFAULT_BACKGROUND = 'white'
const TRANSITION_DURATION = '0.3s'

interface Term {
  id: string
  title: string
  description: React.ReactNode
}

const terms: Term[] = [
  {
    id: 'normal-distribution',
    title: '正規分布（Normal Distribution）',
    description: (
      <>
        正規分布（Normal Distribution）は、ガウス分布とも呼ばれ、自然界や社会現象で最も頻繁に現れる確率分布です。平均値を中心に左右対称な釣鐘型（ベル型）の形状を持ち、<Link href="/words?q=mean" style={{ textDecoration: 'none' }}>平均（μ）</Link>と<Link href="/words?q=standard-deviation" style={{ textDecoration: 'none' }}>標準偏差（σ）</Link>の2つのパラメータで完全に決定されます。身長、テストの点数、測定誤差など、多くの現象が正規分布に従います。<Link href="/words?q=central-limit-theorem" style={{ textDecoration: 'none' }}>中心極限定理</Link>により、多数の独立した確率変数の和は正規分布に近づく性質があります。
      </>
    )
  },
  {
    id: 'gaussian-distribution',
    title: 'ガウス分布（Gaussian Distribution）',
    description: (
      <>
        ガウス分布（Gaussian Distribution）は、<Link href="/words?q=normal-distribution" style={{ textDecoration: 'none' }}>正規分布</Link>の別名です。ドイツの数学者カール・フリードリヒ・ガウスにちなんで名付けられました。ガウスは誤差論の研究において、測定誤差がこの分布に従うことを示しました。数学的には、確率密度関数 f(x) = (1/√(2πσ²)) × e^(-(x-μ)²/(2σ²)) で表されます。
      </>
    )
  },
  {
    id: 'mean',
    title: '平均（μ: ミュー）',
    description: (
      <>
        平均（Mean）は、データの中心的な位置を表す統計量です。<Link href="/words?q=normal-distribution" style={{ textDecoration: 'none' }}>正規分布</Link>においては、分布の中心位置を決定するパラメータで、ギリシャ文字μ（ミュー）で表されます。平均値を変更すると、分布全体が左右に平行移動します。正規分布では、平均=<Link href="/words?q=median" style={{ textDecoration: 'none' }}>中央値</Link>=<Link href="/words?q=mode" style={{ textDecoration: 'none' }}>最頻値</Link>が一致する特徴があります。
      </>
    )
  },
  {
    id: 'standard-deviation',
    title: '標準偏差（σ: シグマ）',
    description: (
      <>
        標準偏差（Standard Deviation）は、データのばらつき（散らばり具合）を表す統計量で、ギリシャ文字σ（シグマ）で表されます。標準偏差が大きいほど、データは<Link href="/words?q=mean" style={{ textDecoration: 'none' }}>平均</Link>から広く分散し、小さいほど平均の周りに集中します。<Link href="/words?q=variance" style={{ textDecoration: 'none' }}>分散</Link>の平方根として定義され、元のデータと同じ単位を持つため解釈しやすい特徴があります。<Link href="/words?q=68-95-99-rule" style={{ textDecoration: 'none' }}>68-95-99.7ルール</Link>で、データの分布範囲を直感的に理解できます。
      </>
    )
  },
  {
    id: 'variance',
    title: '分散（Variance）',
    description: (
      <>
        分散（Variance）は、データのばらつきを表す統計量で、各データが<Link href="/words?q=mean" style={{ textDecoration: 'none' }}>平均</Link>からどれだけ離れているかの二乗の平均値として定義されます。記号σ²で表され、<Link href="/words?q=standard-deviation" style={{ textDecoration: 'none' }}>標準偏差</Link>を二乗した値です。分散が大きいほどデータのばらつきが大きく、小さいほど平均の周りに集中していることを意味します。数学的な扱いが容易なため、統計理論では標準偏差よりも分散が用いられることが多くあります。
      </>
    )
  },
  {
    id: '68-95-99-rule',
    title: '68-95-99.7ルール',
    description: (
      <>
        68-95-99.7ルール（Empirical Rule）は、<Link href="/words?q=normal-distribution" style={{ textDecoration: 'none' }}>正規分布</Link>において、データがどの範囲に集中するかを示す経験則です。<Link href="/words?q=mean" style={{ textDecoration: 'none' }}>平均（μ）</Link>±1<Link href="/words?q=standard-deviation" style={{ textDecoration: 'none' }}>標準偏差（σ）</Link>の範囲に約68.27%、μ±2σの範囲に約95.45%、μ±3σの範囲に約99.73%のデータが含まれます。この法則は、データの異常値や外れ値を判断する基準として広く利用されています。
      </>
    )
  },
  {
    id: 'galton-board',
    title: 'ゴルトンボード（Galton Board）',
    description: (
      <>
        ゴルトンボード（Galton Board）は、フランシス・ゴルトンが発明した、<Link href="/words?q=normal-distribution" style={{ textDecoration: 'none' }}>正規分布</Link>を視覚的に理解するための教育ツールです。ビーンマシン（Bean Machine）とも呼ばれます。ボールが上から落下し、各段のペグ（釘）に当たるたびにランダムに左右どちらかに落ちます。この過程を繰り返すと、最終的にボールの分布が正規分布に近づきます。<Link href="/words?q=binomial-distribution" style={{ textDecoration: 'none' }}>二項分布</Link>と<Link href="/words?q=central-limit-theorem" style={{ textDecoration: 'none' }}>中心極限定理</Link>を直感的に理解できる優れた教材です。
      </>
    )
  },
  {
    id: 'central-limit-theorem',
    title: '中心極限定理（Central Limit Theorem）',
    description: (
      <>
        中心極限定理（Central Limit Theorem）は、統計学における最も重要な定理の一つです。元の分布の形状に関わらず、独立した確率変数の和（または平均）の分布は、サンプルサイズが大きくなるにつれて<Link href="/words?q=normal-distribution" style={{ textDecoration: 'none' }}>正規分布</Link>に近づくという定理です。この定理により、多くの自然現象や社会現象が正規分布に従う理由が説明できます。<Link href="/words?q=galton-board" style={{ textDecoration: 'none' }}>ゴルトンボード</Link>は、この定理を視覚的に示す優れた例です。
      </>
    )
  },
  {
    id: 'binomial-distribution',
    title: '二項分布（Binomial Distribution）',
    description: (
      <>
        二項分布（Binomial Distribution）は、成功確率がpの試行をn回繰り返したときの成功回数の分布です。<Link href="/words?q=galton-board" style={{ textDecoration: 'none' }}>ゴルトンボード</Link>では、各ペグで右に落ちる確率が0.5の試行を繰り返すため、ボールの最終位置は二項分布に従います。試行回数nが大きくなると、<Link href="/words?q=central-limit-theorem" style={{ textDecoration: 'none' }}>中心極限定理</Link>により、二項分布は<Link href="/words?q=normal-distribution" style={{ textDecoration: 'none' }}>正規分布</Link>で近似できるようになります。
      </>
    )
  },
  {
    id: 'probability-density-function',
    title: '確率密度関数（PDF）',
    description: (
      <>
        確率密度関数（Probability Density Function、PDF）は、連続確率変数がある値を取る相対的な可能性を示す関数です。<Link href="/words?q=normal-distribution" style={{ textDecoration: 'none' }}>正規分布</Link>の確率密度関数は、釣鐘型の曲線を描き、f(x) = (1/√(2πσ²)) × e^(-(x-μ)²/(2σ²)) で表されます。曲線下の面積が確率を表し、全体の面積は1になります。<Link href="/words?q=mean" style={{ textDecoration: 'none' }}>平均μ</Link>で最大値を取り、そこから離れるにつれて値が小さくなります。
      </>
    )
  },
  {
    id: 'median',
    title: '中央値（Median）',
    description: (
      <>
        中央値（Median）は、データを大きさの順に並べたときに中央に位置する値です。データを2等分する位置にあり、外れ値の影響を受けにくい特徴があります。<Link href="/words?q=normal-distribution" style={{ textDecoration: 'none' }}>正規分布</Link>のような対称な分布では、中央値は<Link href="/words?q=mean" style={{ textDecoration: 'none' }}>平均</Link>と<Link href="/words?q=mode" style={{ textDecoration: 'none' }}>最頻値</Link>に一致します。
      </>
    )
  },
  {
    id: 'mode',
    title: '最頻値（Mode）',
    description: (
      <>
        最頻値（Mode）は、データの中で最も頻繁に現れる値です。<Link href="/words?q=probability-density-function" style={{ textDecoration: 'none' }}>確率密度関数</Link>が最大値を取る点として定義されます。<Link href="/words?q=normal-distribution" style={{ textDecoration: 'none' }}>正規分布</Link>では、最頻値は<Link href="/words?q=mean" style={{ textDecoration: 'none' }}>平均</Link>と<Link href="/words?q=median" style={{ textDecoration: 'none' }}>中央値</Link>に一致し、分布の中心に位置します。
      </>
    )
  },
  {
    id: 'z-score',
    title: 'Z得点（Z-score）',
    description: (
      <>
        Z得点（Z-score、標準得点）は、あるデータが<Link href="/words?q=mean" style={{ textDecoration: 'none' }}>平均</Link>からどれだけ離れているかを<Link href="/words?q=standard-deviation" style={{ textDecoration: 'none' }}>標準偏差</Link>の単位で表した値です。Z = (X - μ) / σ で計算されます。Z得点が0なら平均と同じ、正なら平均より大きく、負なら平均より小さいことを意味します。異なる単位や尺度のデータを標準化して比較する際に使用されます。偏差値は、Z得点を平均50、標準偏差10に変換したものです。
      </>
    )
  },
  {
    id: 'standard-normal-distribution',
    title: '標準正規分布',
    description: (
      <>
        標準正規分布（Standard Normal Distribution）は、<Link href="/words?q=mean" style={{ textDecoration: 'none' }}>平均</Link>が0、<Link href="/words?q=standard-deviation" style={{ textDecoration: 'none' }}>標準偏差</Link>が1の<Link href="/words?q=normal-distribution" style={{ textDecoration: 'none' }}>正規分布</Link>です。任意の正規分布は、<Link href="/words?q=z-score" style={{ textDecoration: 'none' }}>Z得点</Link>変換によって標準正規分布に変換できます。統計的検定や確率計算で広く使用され、標準正規分布表（Z表）を用いて確率を求めることができます。
      </>
    )
  }
]

export default function WordsPage (): React.JSX.Element {
  const searchParams = useSearchParams()
  const q = searchParams.get('q')
  const termRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    if (q === null || q === '') {
      return
    }

    const element = termRefs.current[q]
    if (element === null || element === undefined) {
      return
    }

    // スクロール位置を調整（ヘッダー分のオフセットを考慮）
    const elementPosition = element.getBoundingClientRect().top + window.scrollY
    window.scrollTo({
      top: elementPosition - SCROLL_OFFSET,
      behavior: 'smooth'
    })
  }, [q])

  return (
    <Container className="py-5">
      <h1 className="mb-4">📚 用語集</h1>
      <p className="mb-4">
        正規分布と統計学に関連する主要な用語を解説します。
        用語は相互にリンクされており、クリックすることで関連する用語にジャンプできます。
      </p>

      {terms.map((term) => (
        <Card
          key={term.id}
          className="mb-3"
          ref={(el) => { termRefs.current[term.id] = el }}
          style={{
            backgroundColor: q === term.id ? HIGHLIGHT_BACKGROUND : DEFAULT_BACKGROUND,
            transition: `background-color ${TRANSITION_DURATION} ease`
          }}
        >
          <Card.Body>
            <Card.Title>{term.title}</Card.Title>
            <Card.Text>{term.description}</Card.Text>
          </Card.Body>
        </Card>
      ))}
    </Container>
  )
}
