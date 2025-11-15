import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'

/**
 * 配置Monaco Editor使用本地worker文件
 * 避免CSP问题
 */
export function configureMonaco() {
  // @ts-ignore
  self.MonacoEnvironment = {
    getWorker(_: any, label: string) {
      if (label === 'json') {
        return new jsonWorker()
      }
      return new editorWorker()
    }
  }
  
  // 使用本地加载的monaco实例
  loader.config({ monaco })
}

