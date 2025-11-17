'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Container, Card, Row, Col, Form } from 'react-bootstrap'

// 定数定義
const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 400
const PADDING = 60
const PADDING_MULTIPLIER = 2
const GRAPH_WIDTH = CANVAS_WIDTH - PADDING * PADDING_MULTIPLIER
const GRAPH_HEIGHT = CANVAS_HEIGHT - PADDING * PADDING_MULTIPLIER
const BACKGROUND_COLOR = '#ffffff'
const AXIS_COLOR = '#333333'
const CURVE_COLOR = '#4dabf7'
const RANGE_FILL_COLOR = 'rgba(77, 171, 247, 0.3)'
const GRID_COLOR = '#e0e0e0'
const TEXT_COLOR = '#333333'
const DEFAULT_MEAN = 50
const DEFAULT_STD_DEV = 10
const DEFAULT_RANGE_START = 40
const DEFAULT_RANGE_END = Infinity
const STANDARD_DEVIATIONS = 4
const CURVE_POINTS = 200
const AXIS_ARROW_SIZE = 10
const LABEL_FONT = '12px sans-serif'
const TITLE_FONT = '14px sans-serif'
const TWO = 2
const HALF = 0.5
const ONE = 1
const ZERO = 0
const PI = Math.PI
const SQRT_2PI = Math.sqrt(TWO * PI)
const DECIMAL_PLACES = 4
const PERCENTAGE_MULTIPLIER = 100
const PERCENT_DECIMAL_PLACES = 2
const Y_MAX_MULTIPLIER = 1.1
const TICK_LENGTH = 5
const AXIS_LABEL_OFFSET_X = 20
const AXIS_LABEL_OFFSET_Y = 10
const MEAN_LABEL_OFFSET = 5
const MEAN_LABEL_Y_OFFSET = 20
const DASH_LENGTH = 5
const STD_DEV_MULTIPLIER_1 = 1
const STD_DEV_MULTIPLIER_2 = 2
const STD_DEV_MULTIPLIER_3 = 3
const STD_DEV_MULTIPLIERS = [STD_DEV_MULTIPLIER_1, STD_DEV_MULTIPLIER_2, STD_DEV_MULTIPLIER_3] as const
const DISPLAY_DECIMAL_PLACE = 1
const MIN_STD_DEV = 0.1
// 誤差関数近似の係数（Abramowitz and Stegun approximation）
const ERF_COEF_0 = 1.26551223
const ERF_COEF_1 = 1.00002368
const ERF_COEF_2 = 0.37409196
const ERF_COEF_3 = 0.09678418
const ERF_COEF_4 = -0.18628806
const ERF_COEF_5 = 0.27886807
const ERF_COEF_6 = -1.13520398
const ERF_COEF_7 = 1.48851587
const ERF_COEF_8 = -0.82215223
const ERF_COEF_9 = 0.17087277

interface GraphProps {
  mean: number
  stdDev: number
  rangeStart: number | null
  rangeEnd: number | null
}

export default function GraphPage (): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mean, setMean] = useState(DEFAULT_MEAN)
  const [stdDev, setStdDev] = useState(DEFAULT_STD_DEV)
  const [rangeStart, setRangeStart] = useState<number | null>(DEFAULT_RANGE_START)
  const [rangeEnd, setRangeEnd] = useState<number | null>(DEFAULT_RANGE_END)

  // 正規分布の確率密度関数
  const normalPDF = useCallback((x: number, mu: number, sigma: number): number => {
    const exponent = -((x - mu) ** TWO) / (TWO * sigma ** TWO)
    return Math.exp(exponent) / (sigma * SQRT_2PI)
  }, [])

  // 累積分布関数（近似）- 誤差関数を使用
  const normalCDF = useCallback((x: number, mu: number, sigma: number): number => {
    const z = (x - mu) / sigma
    // 誤差関数の近似
    const erf = (z: number): number => {
      const t = ONE / (ONE + HALF * Math.abs(z))
      const tau = t * Math.exp(-z * z - ERF_COEF_0 +
        t * (ERF_COEF_1 +
        t * (ERF_COEF_2 +
        t * (ERF_COEF_3 +
        t * (ERF_COEF_4 +
        t * (ERF_COEF_5 +
        t * (ERF_COEF_6 +
        t * (ERF_COEF_7 +
        t * (ERF_COEF_8 +
        t * ERF_COEF_9)))))))))
      return z >= ZERO ? ONE - tau : tau - ONE
    }
    return HALF * (ONE + erf(z / Math.sqrt(TWO)))
  }, [])

  // 範囲内の確率を計算
  const calculateProbability = useCallback((): number => {
    if (rangeStart === null || rangeEnd === null) return ZERO
    const cdfEnd = normalCDF(rangeEnd, mean, stdDev)
    const cdfStart = normalCDF(rangeStart, mean, stdDev)
    return cdfEnd - cdfStart
  }, [mean, stdDev, rangeStart, rangeEnd, normalCDF])

  // グラフを描画
  const draw = useCallback(({ mean, stdDev, rangeStart, rangeEnd }: GraphProps) => {
    const canvas = canvasRef.current
    if (canvas == null) return

    const ctx = canvas.getContext('2d')
    if (ctx == null) return

    // 背景をクリア
    ctx.fillStyle = BACKGROUND_COLOR
    ctx.fillRect(ZERO, ZERO, CANVAS_WIDTH, CANVAS_HEIGHT)

    // X軸の範囲を設定（平均 ± 4標準偏差）
    const xMin = mean - STANDARD_DEVIATIONS * stdDev
    const xMax = mean + STANDARD_DEVIATIONS * stdDev

    // Y軸の最大値を計算（平均での確率密度）
    const yMax = normalPDF(mean, mean, stdDev) * Y_MAX_MULTIPLIER

    // 座標変換関数
    const toCanvasX = (x: number): number => PADDING + ((x - xMin) / (xMax - xMin)) * GRAPH_WIDTH

    const toCanvasY = (y: number): number => CANVAS_HEIGHT - PADDING - (y / yMax) * GRAPH_HEIGHT

    // グリッド線を描画
    ctx.strokeStyle = GRID_COLOR
    ctx.lineWidth = ONE

    // 垂直グリッド線（標準偏差ごと）
    for (let i = -STANDARD_DEVIATIONS; i <= STANDARD_DEVIATIONS; i += ONE) {
      const x = mean + i * stdDev
      const canvasX = toCanvasX(x)
      ctx.beginPath()
      ctx.moveTo(canvasX, PADDING)
      ctx.lineTo(canvasX, CANVAS_HEIGHT - PADDING)
      ctx.stroke()
    }

    // 範囲の塗りつぶし
    if (rangeStart !== null && rangeEnd !== null) {
      // 無限大の場合は表示範囲の端を使用
      const effectiveStart = rangeStart === -Infinity ? xMin : rangeStart
      const effectiveEnd = rangeEnd === Infinity ? xMax : rangeEnd

      ctx.fillStyle = RANGE_FILL_COLOR
      ctx.beginPath()
      ctx.moveTo(toCanvasX(effectiveStart), toCanvasY(ZERO))

      for (let i = ZERO; i <= CURVE_POINTS; i += ONE) {
        const x = effectiveStart + (effectiveEnd - effectiveStart) * (i / CURVE_POINTS)
        const y = normalPDF(x, mean, stdDev)
        ctx.lineTo(toCanvasX(x), toCanvasY(y))
      }

      ctx.lineTo(toCanvasX(effectiveEnd), toCanvasY(ZERO))
      ctx.closePath()
      ctx.fill()
    }

    // 正規分布曲線を描画
    ctx.strokeStyle = CURVE_COLOR
    ctx.lineWidth = TWO
    ctx.beginPath()

    for (let i = ZERO; i <= CURVE_POINTS; i += ONE) {
      const x = xMin + (xMax - xMin) * (i / CURVE_POINTS)
      const y = normalPDF(x, mean, stdDev)
      const canvasX = toCanvasX(x)
      const canvasY = toCanvasY(y)

      if (i === ZERO) {
        ctx.moveTo(canvasX, canvasY)
      } else {
        ctx.lineTo(canvasX, canvasY)
      }
    }

    ctx.stroke()

    // 軸を描画
    ctx.strokeStyle = AXIS_COLOR
    ctx.lineWidth = TWO

    // X軸
    ctx.beginPath()
    ctx.moveTo(PADDING, CANVAS_HEIGHT - PADDING)
    ctx.lineTo(CANVAS_WIDTH - PADDING, CANVAS_HEIGHT - PADDING)
    ctx.stroke()

    // Y軸
    ctx.beginPath()
    ctx.moveTo(PADDING, CANVAS_HEIGHT - PADDING)
    ctx.lineTo(PADDING, PADDING)
    ctx.stroke()

    // X軸の矢印
    ctx.beginPath()
    ctx.moveTo(CANVAS_WIDTH - PADDING, CANVAS_HEIGHT - PADDING)
    ctx.lineTo(CANVAS_WIDTH - PADDING - AXIS_ARROW_SIZE, CANVAS_HEIGHT - PADDING - AXIS_ARROW_SIZE / TWO)
    ctx.lineTo(CANVAS_WIDTH - PADDING - AXIS_ARROW_SIZE, CANVAS_HEIGHT - PADDING + AXIS_ARROW_SIZE / TWO)
    ctx.closePath()
    ctx.fill()

    // Y軸の矢印
    ctx.beginPath()
    ctx.moveTo(PADDING, PADDING)
    ctx.lineTo(PADDING - AXIS_ARROW_SIZE / TWO, PADDING + AXIS_ARROW_SIZE)
    ctx.lineTo(PADDING + AXIS_ARROW_SIZE / TWO, PADDING + AXIS_ARROW_SIZE)
    ctx.closePath()
    ctx.fill()

    // 目盛りとラベル
    ctx.fillStyle = TEXT_COLOR
    ctx.font = LABEL_FONT
    ctx.textAlign = 'center'

    for (let i = -STANDARD_DEVIATIONS; i <= STANDARD_DEVIATIONS; i += ONE) {
      const x = mean + i * stdDev
      const canvasX = toCanvasX(x)

      // 目盛り
      ctx.beginPath()
      ctx.moveTo(canvasX, CANVAS_HEIGHT - PADDING)
      ctx.lineTo(canvasX, CANVAS_HEIGHT - PADDING + TICK_LENGTH)
      ctx.stroke()

      // ラベル
      ctx.fillText(x.toFixed(ZERO), canvasX, CANVAS_HEIGHT - PADDING + AXIS_LABEL_OFFSET_X)
    }

    // 軸ラベル
    ctx.font = TITLE_FONT
    ctx.textAlign = 'center'
    ctx.fillText('x', CANVAS_WIDTH - PADDING + AXIS_LABEL_OFFSET_X, CANVAS_HEIGHT - PADDING + TICK_LENGTH)
    ctx.fillText('f(x)', PADDING - AXIS_LABEL_OFFSET_X, PADDING - AXIS_LABEL_OFFSET_Y)

    // 平均線
    const meanX = toCanvasX(mean)
    ctx.strokeStyle = '#ff6b6b'
    ctx.lineWidth = TWO
    ctx.setLineDash([DASH_LENGTH, DASH_LENGTH])
    ctx.beginPath()
    ctx.moveTo(meanX, PADDING)
    ctx.lineTo(meanX, CANVAS_HEIGHT - PADDING)
    ctx.stroke()
    ctx.setLineDash([])

    // 平均ラベル
    ctx.fillStyle = '#ff6b6b'
    ctx.font = LABEL_FONT
    ctx.textAlign = 'left'
    ctx.fillText(`μ = ${mean}`, meanX + MEAN_LABEL_OFFSET, PADDING + MEAN_LABEL_Y_OFFSET)
  }, [normalPDF])

  // 描画更新
  useEffect(() => {
    draw({ mean, stdDev, rangeStart, rangeEnd })
  }, [mean, stdDev, rangeStart, rangeEnd, draw])

  const probability = calculateProbability()

  return (
    <Container className="py-5">
      <h1 className="mb-4">📈 正規分布グラフ</h1>

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Body>
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  display: 'block',
                  width: '100%',
                  height: 'auto'
                }}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-4">
            <Card.Body>
              <h6>分布のパラメータ</h6>
              <Form.Group className="mb-3">
                <Form.Label>平均（μ）</Form.Label>
                <Form.Control
                  type="number"
                  value={mean}
                  onChange={(e) => { setMean(Number(e.target.value)) }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>標準偏差（σ）</Form.Label>
                <Form.Control
                  type="number"
                  value={stdDev}
                  min={MIN_STD_DEV}
                  step={MIN_STD_DEV}
                  onChange={(e) => { setStdDev(Math.max(MIN_STD_DEV, Number(e.target.value))) }}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Body>
              <h6>確率計算範囲</h6>
              <Form.Group className="mb-3">
                <Form.Label>開始値</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="number"
                    value={rangeStart === -Infinity ? '' : (rangeStart ?? '')}
                    onChange={(e) => { setRangeStart(e.target.value === '' ? null : Number(e.target.value)) }}
                    placeholder="数値を入力"
                    disabled={rangeStart === -Infinity}
                  />
                  <button
                    type="button"
                    className={`btn ${rangeStart === -Infinity ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => { setRangeStart(rangeStart === -Infinity ? null : -Infinity) }}
                    style={{ minWidth: '60px' }}
                  >
                    -∞
                  </button>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>終了値</Form.Label>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="number"
                    value={rangeEnd === Infinity ? '' : (rangeEnd ?? '')}
                    onChange={(e) => { setRangeEnd(e.target.value === '' ? null : Number(e.target.value)) }}
                    placeholder="数値を入力"
                    disabled={rangeEnd === Infinity}
                  />
                  <button
                    type="button"
                    className={`btn ${rangeEnd === Infinity ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => { setRangeEnd(rangeEnd === Infinity ? null : Infinity) }}
                    style={{ minWidth: '60px' }}
                  >
                    +∞
                  </button>
                </div>
              </Form.Group>

              {rangeStart !== null && rangeEnd !== null && (
                <div className="mt-3 p-3 bg-light rounded">
                  <strong>確率:</strong>
                  <div className="h4 mb-0 mt-2 text-primary">
                    {(probability * PERCENTAGE_MULTIPLIER).toFixed(PERCENT_DECIMAL_PLACES)}%
                  </div>
                  <small className="text-muted">
                    P({rangeStart === -Infinity ? '-∞' : rangeStart} ≤ X ≤ {rangeEnd === Infinity ? '+∞' : rangeEnd}) = {probability.toFixed(DECIMAL_PLACES)}
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <h6>68-95-99.7ルール</h6>
              <ul className="mb-0 small">
                <li>μ ± σ: 約68.27%</li>
                <li>μ ± 2σ: 約95.45%</li>
                <li>μ ± 3σ: 約99.73%</li>
              </ul>
              <div className="mt-2 small text-muted">
                <div>μ - σ = {(mean - STD_DEV_MULTIPLIERS[ZERO] * stdDev).toFixed(DISPLAY_DECIMAL_PLACE)}</div>
                <div>μ + σ = {(mean + STD_DEV_MULTIPLIERS[ZERO] * stdDev).toFixed(DISPLAY_DECIMAL_PLACE)}</div>
                <div>μ - 2σ = {(mean - STD_DEV_MULTIPLIERS[ONE] * stdDev).toFixed(DISPLAY_DECIMAL_PLACE)}</div>
                <div>μ + 2σ = {(mean + STD_DEV_MULTIPLIERS[ONE] * stdDev).toFixed(DISPLAY_DECIMAL_PLACE)}</div>
                <div>μ - 3σ = {(mean - STD_DEV_MULTIPLIERS[TWO] * stdDev).toFixed(DISPLAY_DECIMAL_PLACE)}</div>
                <div>μ + 3σ = {(mean + STD_DEV_MULTIPLIERS[TWO] * stdDev).toFixed(DISPLAY_DECIMAL_PLACE)}</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mt-4">
        <Card.Body>
          <h5 className="mb-3">使い方</h5>
          <ul>
            <li><strong>平均（μ）:</strong> 分布の中心位置を決定します。値を変更すると、グラフ全体が左右に移動します。</li>
            <li><strong>標準偏差（σ）:</strong> データのばらつきを表します。大きいほどグラフが横に広がり、小さいほど中心に集中します。</li>
            <li><strong>確率計算:</strong> 開始値と終了値を入力すると、その範囲内にデータが含まれる確率が計算されます。</li>
            <li><strong>グラフの見方:</strong> 赤い破線は平均値を示し、青い曲線が正規分布の形状を表します。水色の塗りつぶし領域が指定範囲の確率を視覚的に示します。</li>
          </ul>
        </Card.Body>
      </Card>
    </Container>
  )
}
