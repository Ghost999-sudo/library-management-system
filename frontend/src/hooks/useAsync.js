import { useCallback, useEffect, useRef, useState } from 'react'

/** Reusable loading/error/data state for a single API request. */
export function useAsync(asyncFn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const fnRef = useRef(asyncFn)
  fnRef.current = asyncFn

  const run = useCallback(async () => {
    setState((previous) => ({ ...previous, loading: true, error: null }))
    try {
      const data = await fnRef.current()
      setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      setState({ data: null, loading: false, error })
      return null
    }
  }, [])

  useEffect(() => {
    run()
    // Dependencies are supplied by the caller, like a useEffect dependency array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { ...state, run }
}
