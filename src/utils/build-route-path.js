export function buildRoutePath(path) {
  const routeParamRegex = /:([a-zA-z]+)/g

  const paramsWithParams = path.replaceAll(
    routeParamRegex,
    // eslint-disable-next-line
    '(?<$1>[a-z0-9\-_]+)',
  )
  const pathRegex = new RegExp(`^${paramsWithParams}$`)

  return pathRegex
}
