'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Container, Card, Button, Row, Col } from 'react-bootstrap'

// 定数定義
const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 600
const BALL_SIZE = 2
const LEVELS = 15
const BALL_SPEED = 3
const PEG_RADIUS = 3
const SLOT_WIDTH = 20
const HALF = 2
const START_X = CANVAS_WIDTH / HALF
const START_Y = 50
const PROBABILITY = 0.5
const ANIMATION_INTERVAL = 16
const PEG_COLOR = '#333'
const BALL_COLOR = '#ff6b6b'
const SLOT_BAR_COLOR = '#4dabf7'
const BACKGROUND_COLOR = '#f8f9fa'
const MAX_SLOT_HEIGHT = 200
const MIN_BALL_INTERVAL = 16
const MAX_BALL_INTERVAL = 1000
const DEFAULT_BALL_INTERVAL = 200
const INITIAL_BALL_LEVEL = -1
const FIRST_LEVEL = 0
const INITIAL_PEG_INDEX = 0
const BALL_START_OFFSET = 30
const PEG_VERTICAL_SPACING = 1.5
const SLOT_BAR_WIDTH_DIVISOR = 4
const SLOT_BAR_HEIGHT_DIVISOR = 2
const CANVAS_BOTTOM_MARGIN = 10
const ABSOLUTE_MODE_HEIGHT_MULTIPLIER = 0.5
const MILLISECONDS_PER_SECOND = 1000
const DECIMAL_PLACES = 1
const INITIAL_COUNT = 0
const INCREMENT = 1
const DIRECTION_THRESHOLD = 1
const DIRECTION_LEFT = -1
const DIRECTION_RIGHT = 1
const FULL_CIRCLE_RADIANS = Math.PI * HALF
const STEP_SIZE = 50

interface Ball {
  id: number
  x: number
  y: number
  level: number
  targetX: number
  pegIndex: number
  isActive: boolean
}

export default function DistributionPage (): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [balls, setBalls] = useState<Ball[]>([])
  const [slots, setSlots] = useState<number[]>(new Array(LEVELS + INCREMENT).fill(INITIAL_COUNT))
  const [isRunning, setIsRunning] = useState(false)
  const [totalBalls, setTotalBalls] = useState(INITIAL_COUNT)
  const [ballInterval, setBallInterval] = useState(DEFAULT_BALL_INTERVAL)
  const [useRelativeHeight, setUseRelativeHeight] = useState(true)
  const ballIdRef = useRef(INITIAL_COUNT)

  // スロットにボールを追加するヘルパー関数
  const addBallToSlot = useCallback((pegIndex: number) => {
    const slotIndex = pegIndex
    const clampedSlotIndex = Math.max(INITIAL_COUNT, Math.min(LEVELS, slotIndex))

    setSlots(prevSlots => {
      const newSlots = [...prevSlots]
      newSlots[clampedSlotIndex] = (newSlots[clampedSlotIndex] ?? INITIAL_COUNT) + INCREMENT
      return newSlots
    })
  }, [])

  // ペグの位置を計算
  const getPegPosition = useCallback((level: number, index: number): { x: number, y: number } => {
    const spacing = SLOT_WIDTH
    const xOffset = (LEVELS - level) * spacing / HALF
    return {
      x: xOffset + index * spacing + START_X - (LEVELS * spacing) / HALF,
      y: START_Y + level * spacing * PEG_VERTICAL_SPACING
    }
  }, [])

  // スロットの位置を計算
  const getSlotX = useCallback((slotIndex: number): number => {
    const spacing = SLOT_WIDTH
    return START_X - (LEVELS * spacing) / HALF + slotIndex * spacing
  }, [])

  const addBall = useCallback(() => {
    // 一番上のペグの位置を取得
    const firstPeg = getPegPosition(FIRST_LEVEL, INITIAL_PEG_INDEX)
    const newBall: Ball = {
      id: ballIdRef.current,
      x: START_X,
      y: firstPeg.y - BALL_START_OFFSET,
      level: INITIAL_BALL_LEVEL,
      targetX: START_X,
      pegIndex: INITIAL_PEG_INDEX,
      isActive: true
    }
    ballIdRef.current += INCREMENT
    setBalls(prev => [...prev, newBall])
    setTotalBalls(prev => prev + INCREMENT)
  }, [getPegPosition])

  // ボールの移動を更新
  const updateBalls = useCallback(() => {
    setBalls(prevBalls => {
      const updatedBalls = prevBalls.map(ball => {
        if (!ball.isActive) return ball

        const newBall = { ...ball }

        // Y方向に移動
        newBall.y += BALL_SPEED

        // X方向にターゲットに向かって移動
        if (Math.abs(newBall.x - newBall.targetX) > DIRECTION_THRESHOLD) {
          const direction = newBall.targetX > newBall.x ? DIRECTION_RIGHT : DIRECTION_LEFT
          newBall.x += direction * BALL_SPEED
        } else {
          newBall.x = newBall.targetX
        }

        // 次のレベルのペグに到達したか確認
        if (ball.level <= LEVELS) {
          // 現在のペグの位置を取得（level -1の場合は最初のペグ）
          const currentPeg = ball.level === INITIAL_BALL_LEVEL
            ? getPegPosition(FIRST_LEVEL, INITIAL_PEG_INDEX)
            : getPegPosition(ball.level, ball.pegIndex)

          if (newBall.y >= currentPeg.y) {
            newBall.level += INCREMENT

            // 最下部のペグ（レベル15）に到達したらスロットに追加
            if (newBall.level > LEVELS) {
              addBallToSlot(newBall.pegIndex)
              newBall.isActive = false
            } else if (ball.level === INITIAL_BALL_LEVEL) {
              // level -1 から level 0 に移行する場合は、常に pegIndex 0（中央）に行く
              newBall.pegIndex = INITIAL_PEG_INDEX
              const nextPegPos = getPegPosition(newBall.level, newBall.pegIndex)
              newBall.targetX = nextPegPos.x
            } else {
              // ランダムに左右どちらかに移動
              const goRight = Math.random() < PROBABILITY
              const nextPegIndex = goRight ? ball.pegIndex + INCREMENT : ball.pegIndex

              // pegIndexがそのレベルの範囲内に収まるようにクランプ
              newBall.pegIndex = Math.max(INITIAL_COUNT, Math.min(newBall.level, nextPegIndex))

              const nextPegPos = getPegPosition(newBall.level, newBall.pegIndex)
              newBall.targetX = nextPegPos.x
            }
          }
        }

        return newBall
      })

      // 非アクティブなボールを削除（画面外に出たもの）
      return updatedBalls.filter(ball => ball.isActive || ball.y < CANVAS_HEIGHT)
    })
  }, [getPegPosition, addBallToSlot])

  // 描画
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (canvas == null) return

    const ctx = canvas.getContext('2d')
    if (ctx == null) return

    // 背景をクリア
    ctx.fillStyle = BACKGROUND_COLOR
    ctx.fillRect(INITIAL_COUNT, INITIAL_COUNT, CANVAS_WIDTH, CANVAS_HEIGHT)

    // ペグを描画
    ctx.fillStyle = PEG_COLOR
    for (let level = FIRST_LEVEL; level <= LEVELS; level += INCREMENT) {
      for (let i = INITIAL_PEG_INDEX; i <= level; i += INCREMENT) {
        const pos = getPegPosition(level, i)
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, PEG_RADIUS, INITIAL_COUNT, FULL_CIRCLE_RADIANS)
        ctx.fill()
      }
    }

    // スロットの棒グラフを描画
    const maxSlotValue = Math.max(...slots, INCREMENT)
    ctx.fillStyle = SLOT_BAR_COLOR
    slots.forEach((count, index) => {
      const x = getSlotX(index)
      let barHeight: number = INITIAL_COUNT
      if (useRelativeHeight) {
        // 相対表示: 最大値を基準に正規化
        barHeight = (count / maxSlotValue) * MAX_SLOT_HEIGHT
      } else {
        // 絶対表示: 実際のカウント数をそのまま表示（1個 = 0.5px、上限なし）
        barHeight = count * ABSOLUTE_MODE_HEIGHT_MULTIPLIER
      }
      const bottomY = CANVAS_HEIGHT - CANVAS_BOTTOM_MARGIN
      ctx.fillRect(x - SLOT_WIDTH / SLOT_BAR_WIDTH_DIVISOR, bottomY - barHeight, SLOT_WIDTH / SLOT_BAR_HEIGHT_DIVISOR, barHeight)
    })

    // ボールを描画
    ctx.fillStyle = BALL_COLOR
    balls.forEach(ball => {
      if (ball.isActive) {
        ctx.beginPath()
        ctx.arc(ball.x, ball.y, BALL_SIZE, INITIAL_COUNT, FULL_CIRCLE_RADIANS)
        ctx.fill()
      }
    })
  }, [balls, slots, getPegPosition, getSlotX, useRelativeHeight])

  // アニメーションループ
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      updateBalls()
    }, ANIMATION_INTERVAL)

    return () => { clearInterval(interval) }
  }, [isRunning, updateBalls])

  // 描画更新
  useEffect(() => {
    draw()
  }, [draw])

  // リセット
  const handleReset = useCallback(() => {
    setBalls([])
    setSlots(new Array(LEVELS + INCREMENT).fill(INITIAL_COUNT))
    setTotalBalls(INITIAL_COUNT)
    ballIdRef.current = INITIAL_COUNT
    setIsRunning(false)
  }, [])

  // スライダーの値を変更
  const handleIntervalChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBallInterval(Number(e.target.value))
  }, [])

  // 表示モード切り替え
  const handleToggleHeightMode = useCallback(() => {
    setUseRelativeHeight(prev => !prev)
  }, [])

  // 開始/停止
  const handleToggle = useCallback(() => {
    setIsRunning(prev => !prev)
  }, [])

  // ボール自動投下
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      addBall()
    }, ballInterval)

    return () => { clearInterval(interval) }
  }, [isRunning, addBall, ballInterval])

  return (
    <Container className="py-5" id="DistributionChart">
      <h1 className="mb-4">📊 ゴルトンボード - 正規分布の可視化</h1>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={8}>
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  display: 'block',
                  margin: '0 auto',
                  width: '100%',
                  height: 'auto'
                }}
              />
            </Col>
            <Col md={4}>
              <div className="d-grid gap-2">
                <Button
                  variant={isRunning ? 'danger' : 'primary'}
                  size="lg"
                  onClick={handleToggle}
                >
                  {isRunning ? '⏸ 一時停止' : '▶ 開始'}
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleReset}
                >
                  🔄 リセット
                </Button>
              </div>

              <Card className="mt-4">
                <Card.Body>
                  <h6>投下速度</h6>
                  <div className="mb-3">
                    <label htmlFor="ballIntervalSlider" className="form-label">
                      間隔: {ballInterval}ms ({(MILLISECONDS_PER_SECOND / ballInterval).toFixed(DECIMAL_PLACES)}個/秒)
                    </label>
                    <input
                      type="range"
                      className="form-range"
                      id="ballIntervalSlider"
                      min={MIN_BALL_INTERVAL}
                      max={MAX_BALL_INTERVAL}
                      step={STEP_SIZE}
                      value={ballInterval}
                      onChange={handleIntervalChange}
                    />
                    <div className="d-flex justify-content-between">
                      <small>速い</small>
                      <small>遅い</small>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card className="mt-4">
                <Card.Body>
                  <h6>表示モード</h6>
                  <Button
                    variant={useRelativeHeight ? 'primary' : 'outline-primary'}
                    size="sm"
                    className="me-2"
                    onClick={handleToggleHeightMode}
                  >
                    📊 相対表示
                  </Button>
                  <Button
                    variant={!useRelativeHeight ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={handleToggleHeightMode}
                  >
                    📈 絶対表示
                  </Button>
                  <p className="mt-2 mb-0 small text-muted">
                    {useRelativeHeight
                      ? '最大値を基準に高さを調整（分布の形が見やすい）'
                      : '実際の個数に応じて表示（絶対数がわかりやすい）'}
                  </p>
                </Card.Body>
              </Card>

              <Card className="mt-4">
                <Card.Body>
                  <h6>統計情報</h6>
                  <p className="mb-1"><strong>投下ボール数:</strong> {totalBalls}</p>
                  <p className="mb-1"><strong>アクティブボール:</strong> {balls.filter(b => b.isActive).length}</p>
                  <p className="mb-0"><strong>積算ボール:</strong> {slots.reduce((sum, count) => sum + count, INITIAL_COUNT)}</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">ゴルトンボードとは？</h5>
          <p>
            ゴルトンボード（Galton Board）は、フランシス・ゴルトンが発明した、
            正規分布を視覚的に理解するための教育ツールです。
          </p>

          <h6 className="mt-4">仕組み</h6>
          <ol>
            <li>ボールが上から落下します</li>
            <li>各段のペグ（釘）に当たるたびに、ランダムに左右どちらかに落ちます</li>
            <li>この過程を繰り返すと、最終的にボールは下部のスロットに溜まります</li>
            <li>十分な数のボールを落とすと、スロットの分布が<strong>正規分布</strong>に近づきます</li>
          </ol>

          <h6 className="mt-4">なぜ正規分布になるのか？</h6>
          <p>
            各ペグで左右に落ちる確率が50%ずつの場合、{LEVELS}段のペグを通過すると、
            中央に落ちる組み合わせの数が最も多くなります。
            <br />
            例えば、中央のスロットに到達するには、左右にほぼ同じ回数ずつ落ちる必要があり、
            その組み合わせのパターンが最も多いためです。
            <br />
            これは二項分布に従い、試行回数が増えると正規分布に近似します（中心極限定理）。
          </p>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <h5 className="mb-3">観察のポイント</h5>
          <ul>
            <li><strong>中央が高くなる:</strong> 最も確率が高い結果が中央に現れます</li>
            <li><strong>左右対称:</strong> 左右に落ちる確率が等しいため、分布も対称になります</li>
            <li><strong>ベル型の曲線:</strong> 十分な数のボールを落とすと、釣鐘型の正規分布曲線が形成されます</li>
            <li><strong>予測可能性:</strong> 個々のボールの挙動はランダムですが、全体としては予測可能な分布になります</li>
          </ul>
          <p className="mb-0 mt-3">
            このシミュレーションは、確率と統計の基礎概念を理解するのに最適な教材です。
            何度もリセットして試してみてください！
          </p>
        </Card.Body>
      </Card>
    </Container>
  )
}
