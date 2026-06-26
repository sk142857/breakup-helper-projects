import { useRoutes } from 'react-router-dom'
import { routerConfig } from '@/router'

export default function App() {
  const element = useRoutes(routerConfig)
  return element
}
