import preactRefresh from '@prefresh/vite'
import type { UserConfig } from 'vite'

const config: UserConfig = {
  jsx: 'preact',
  plugins: [preactRefresh()],
  optimizeDeps: {
    exclude: ['todo-server'],
  },
}

export default config
