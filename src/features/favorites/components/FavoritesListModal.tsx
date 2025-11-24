import type { Favorite } from '@/shared/types'
import { shadowRootManager } from '@/shared/utils/shadow-root-manager'
import type { TableColumnsType } from 'antd'
import { Button, Input, Modal, Space, Table } from 'antd'
import React, { useEffect, useMemo, useState } from 'react'

interface FavoritesListModalProps {
  visible: boolean
  favoritesList: Favorite[]
  onPreview: (favorite: Favorite) => void
  onApply: (favorite: Favorite) => void
  onDelete: (id: string) => Promise<void>
  onClose: () => void
}

/**
 * 收藏列表模态框组件
 */
export const FavoritesListModal: React.FC<FavoritesListModalProps> = ({
  visible,
  favoritesList,
  onPreview,
  onApply,
  onDelete,
  onClose
}) => {
  /** 搜索关键词状态 */
  const [searchKeyword, setSearchKeyword] = useState('')
  /** 防抖后的搜索关键词 */
  const [debouncedSearchKeyword, setDebouncedSearchKeyword] = useState('')
  
  /**
   * 搜索防抖逻辑（300ms）
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchKeyword(searchKeyword)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchKeyword])
  
  /**
   * 过滤收藏列表
   * 支持搜索名称、来源参数和内容
   */
  const filteredFavoritesList = useMemo(() => {
    if (!debouncedSearchKeyword.trim()) {
      return favoritesList
    }
    
    const keyword = debouncedSearchKeyword.toLowerCase()
    return favoritesList.filter((favorite) => {
      const nameMatch = favorite.name.toLowerCase().includes(keyword)
      const paramsMatch = favorite.sourceParams.toLowerCase().includes(keyword)
      const contentMatch = favorite.content.toLowerCase().includes(keyword)
      return nameMatch || paramsMatch || contentMatch
    })
  }, [favoritesList, debouncedSearchKeyword])

  const favoritesColumns: TableColumnsType<Favorite> = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      ellipsis: true
    },
    {
      title: '来源参数',
      dataIndex: 'sourceParams',
      key: 'sourceParams',
      width: 160,
      ellipsis: true
    },
    {
      title: '保存时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 140,
      render: (timestamp: number) => new Date(timestamp).toLocaleString('zh-CN')
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: any, record: Favorite) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => onPreview(record)}>
            预览
          </Button>
          <Button type="link" size="small" onClick={() => onApply(record)}>
            应用
          </Button>
          <Button type="link" size="small" danger onClick={() => onDelete(record.id)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <Modal
      title="收藏列表"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      getContainer={shadowRootManager.getContainer}
    >
      <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索收藏名称、来源参数或内容..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          allowClear
          style={{ width: '100%' }}
        />
      </Space>
      <Table
        dataSource={filteredFavoritesList}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        columns={favoritesColumns}
      />
    </Modal>
  )
}

