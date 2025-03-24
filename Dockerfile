# Set the base image to use for subsequent instructions
FROM node:23-alpine

WORKDIR /codeaudits

# Copy the action's code into the container
COPY . .

# Install dependencies and build the action
RUN npm install
RUN npm run build

# Set the entrypoint for the action
ENTRYPOINT ["/codeaudits/entrypoint.sh"]