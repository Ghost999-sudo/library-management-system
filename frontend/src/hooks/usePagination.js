import { useCallback, useState } from 'react'

/** Page/size state shared by every paginated table. Page is 0-based like Spring Data. */
export function usePagination(initialSize = 10) {
  const [page, setPageState] = useState(0)
  const [size, setSizeState] = useState(initialSize)

  const setPage = useCallback((next) => setPageState(Math.max(0, next)), [])
  const setSize = useCallback((next) => {
    setSizeState(next)
    setPageState(0)
  }, [])
  const reset = useCallback(() => setPageState(0), [])

  return { page, size, setPage, setSize, reset, query: { page, size } }
}
