'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Container, Card, Button, Row, Col } from 'react-bootstrap'

import setting from '@/setting'
import pages from '@/pages'

const IMAGE_SIZE = 100

export default function Home (): React.JSX.Element {
  const basePath = setting.basePath ?? ''
  const logoSrc = `${basePath}/tako.png`

  return (
    <Container className='py-4'>
      <div id='Index' className='d-flex flex-column align-items-center'>
        <h1>{setting.title}</h1>
        <Image
          id='Logo'
          className='mt-3 mw-100 border rounded-circle'
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
          src={logoSrc}
          alt='Logo'
        />

        <Card className='mt-4' style={{ maxWidth: '700px', width: '100%' }}>
          <Card.Body>
            <Card.Title className='mb-3'>このアプリケーションについて</Card.Title>
            <p className='mb-3'>
              正規分布（Normal Distribution）を視覚的に理解するためのインタラクティブなツールです。
              統計学の基礎となる正規分布について、様々な角度から学ぶことができます。
            </p>
            <ul className='mb-0'>
              <li>ゴルトンボードのシミュレーション</li>
              <li>正規分布のグラフと確率計算</li>
              <li>統計用語集で基礎知識を学習</li>
            </ul>
          </Card.Body>
        </Card>

        <Card className='mt-4' style={{ maxWidth: '700px', width: '100%' }}>
          <Card.Body>
            <Card.Title className='mb-3'>機能一覧</Card.Title>
            <Row>
              {pages.filter(page => page.path !== '/').map(page => (
                <Col md={6} key={page.path} className='mb-3'>
                  <Link href={page.path} style={{ textDecoration: 'none' }}>
                    <Button variant='outline-primary' className='w-100 text-start'>
                      <span className='me-2'>{page.emoji}</span>
                      <strong>{page.name}</strong>
                    </Button>
                  </Link>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      </div>
    </Container>
  )
}
