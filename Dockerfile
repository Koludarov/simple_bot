FROM node:20-alpine As production

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/dist ./dist

ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

ARG CI_COMMIT_TAG
ENV CI_COMMIT_TAG=$CI_COMMIT_TAG

EXPOSE 3000

RUN apk update

# Start the server using the production build
CMD ["node", "dist/src/main"]
