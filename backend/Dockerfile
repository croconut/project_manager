# build with docker build . -t project-manager 
# then run with docker run -p 5000:5000 --env-file=./.env project-manager
# modifed from: https://gist.github.com/abstractvector/ed3f892ec0114e28b3d6dcdc4c39b1f2
ARG ALPINE_VERSION=3.11
ARG NODE_VERSION=14.15.4

##########################
# Cache-preserving image #
##########################

FROM alpine:${ALPINE_VERSION} AS deps

RUN apk --no-cache add jq

# prevent cache invalidation from changes in fields other than dependencies

COPY package.json .
COPY package-lock.json .

# override the current package version (arbitrarily set to 1.0.0) so it doesn't invalidate the build cache later

RUN (jq '{ dependencies, devDependencies }') < package.json > deps.json
RUN (jq '.version = "1.0.0"' | jq '.packages."".version = "1.0.0"') < package-lock.json > deps-lock.json

###########################
# Node module cache image #
###########################

FROM node:${NODE_VERSION} AS builder

WORKDIR /usr/src

COPY --from=deps deps.json ./package.json
COPY --from=deps deps-lock.json ./package-lock.json

RUN --mount=type=secret,id=npmrc,target=/usr/src/.npmrc npm ci --only=production

####################
# Production image #
####################

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION}

WORKDIR /usr/src

RUN chown node:node /usr/src && \
    apk add --no-cache dumb-init

USER node

# builder supplies node_modules/
COPY --from=builder --chown=node:node /usr/src/node_modules/ node_modules/
# grabbing package.json from actual directory instead of builder
COPY --chown=node:node package.json .

# when packages dont change, only app and build files will get
# updated, and only these copying steps will change
COPY --chown=node:node app/ app/
COPY --chown=node:node build/ build/
COPY --chown=node:node server.js .

# PORT likely will be overwritten by supplied env file / secret
ENV PORT 5000
ENV NODE_ENV production

CMD ["dumb-init", "node", "server"]