# Docker & CI

## Dockerfile

```dockerfile
ARG NEXT_PUBLIC_APP_VERSION
ENV NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION
```

Build must run `inject-version` before `next build`.

## GitLab CI

```yaml
build:
  script:
    - docker build --build-arg NEXT_PUBLIC_APP_VERSION="$CI_COMMIT_SHA" .
```

## Env vars

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_APP_VERSION` | SW version + client query string |
| `CI_COMMIT_SHA` | Fallback in inject-version + version API |
| `PWA_CACHE_PREFIX` | Optional cache namespace in SW template |
