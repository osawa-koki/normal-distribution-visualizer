'use client'

import React from 'react'

export default function AboutPage (): React.JSX.Element {
  return (
    <>
      <div id='About'>
        <h1>正規分布可視化ツールについて</h1>

        <section className='mt-4'>
          <h2>このアプリケーションについて</h2>
          <p className='mt-3'>
            このアプリケーションは、統計学の基礎となる<strong>正規分布（Normal Distribution）</strong>を
            視覚的に理解するためのインタラクティブなツールです。
            <br />
            <br />
            平均（μ）や標準偏差（σ）などのパラメータを変更することで、
            正規分布の形状がどのように変化するかを直感的に学ぶことができます。
          </p>
        </section>

        <section className='mt-5'>
          <h2>正規分布とは</h2>
          <p className='mt-3'>
            正規分布（Normal Distribution）は、ガウス分布（Gaussian Distribution）とも呼ばれ、
            自然界や社会現象において最も頻繁に現れる確率分布の一つです。
            <br />
            <br />
            <strong>特徴：</strong>
          </p>
          <ul className='mt-3'>
            <li><strong>左右対称：</strong>平均値を中心に左右対称な釣鐘型（ベル型）の形状</li>
            <li><strong>平均=中央値=最頻値：</strong>分布の中心が平均値μに一致</li>
            <li><strong>漸近性：</strong>両端は理論上無限に続くが、実質的にゼロに近づく</li>
            <li><strong>確率密度関数：</strong>f(x) = (1/√(2πσ²)) × e^(-(x-μ)²/(2σ²))</li>
          </ul>
        </section>

        <section className='mt-5'>
          <h2>パラメータの意味</h2>

          <h3 className='mt-4'>平均（μ: ミュー）</h3>
          <p className='mt-2'>
            分布の中心位置を決定するパラメータです。
            <br />
            平均値を変更すると、分布全体が左右に移動します。
            <br />
            <strong>例：</strong>身長の平均、テストの平均点など
          </p>

          <h3 className='mt-4'>標準偏差（σ: シグマ）</h3>
          <p className='mt-2'>
            データのばらつき（散らばり具合）を表すパラメータです。
            <br />
            標準偏差が大きいほど、分布は横に広がり、小さいほど中心に集中します。
            <br />
            <strong>例：</strong>個人差の大きさ、測定値のばらつきなど
          </p>
        </section>

        <section className='mt-5'>
          <h2>68-95-99.7ルール</h2>
          <p className='mt-3'>
            正規分布において、データがどの範囲に集中するかを示す重要な法則です：
          </p>
          <ul className='mt-3'>
            <li><strong>μ ± σ：</strong>約68.27%のデータがこの範囲内</li>
            <li><strong>μ ± 2σ：</strong>約95.45%のデータがこの範囲内</li>
            <li><strong>μ ± 3σ：</strong>約99.73%のデータがこの範囲内</li>
          </ul>
          <p className='mt-3'>
            この法則により、データの異常値や外れ値を判断する基準としても利用されます。
          </p>
        </section>

        <section className='mt-5'>
          <h2>正規分布の応用例</h2>
          <ul className='mt-3'>
            <li><strong>品質管理：</strong>製品の寸法や重量のばらつきの管理</li>
            <li><strong>試験の成績：</strong>偏差値の計算や成績分布の分析</li>
            <li><strong>生物学：</strong>身長、体重などの人体測定値の分布</li>
            <li><strong>金融：</strong>株価の変動や投資リスクの評価</li>
            <li><strong>自然科学：</strong>測定誤差の評価や実験データの分析</li>
          </ul>
        </section>

        <section className='mt-5'>
          <h2>このツールの使い方</h2>
          <p className='mt-3'>
            このアプリケーションでは、以下の機能を通じて正規分布を視覚的に理解できます：
          </p>
          <ul className='mt-3'>
            <li>平均（μ）と標準偏差（σ）をインタラクティブに調整</li>
            <li>確率密度関数のグラフをリアルタイムで表示</li>
            <li>特定の範囲内の確率を計算・表示</li>
            <li>複数の正規分布を重ねて比較</li>
            <li>68-95-99.7ルールの視覚的な確認</li>
          </ul>
          <p className='mt-3'>
            ぜひ様々なパラメータを試して、
            正規分布の性質や統計学の基礎を楽しく学んでください。
          </p>
        </section>
      </div>
    </>
  )
}
