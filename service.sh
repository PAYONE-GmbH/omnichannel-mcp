#!/usr/bin/env bash

#########################################
# Environment Variables                 #
#########################################

if [ -f .env ]; then
    source .env
fi

printf "Container Name Prefix: %s\n" "$CONTAINER_NAME_PREFIX"

#########################################
# Variables                             #
#########################################

INPUT_COMMAND=$1
printf "Using command: %s\n" "$INPUT_COMMAND"

COMMAND_RUN="run"
COMMAND_BUILD="build"
COMMAND_REBUILD="rebuild"
COMMAND_UPDATE="update"
COMMAND_RESTART="restart"
COMMAND_STOP="stop"


#########################################
# Functions                             #
#########################################

function build_container_image() {
  if [[ "$1" == "no-cache" ]]; then
    printf "Building without cache...\n"
    docker compose build --no-cache
  else
    printf "Building with cache...\n"
    docker compose build
  fi
}

function process_update() {
  printf "Pulling latest changes from git...\n"
  git pull
  build_container_image
  printf "Starting updated containers...\n"
  docker compose up -d
}

#########################################
# Main Process                          #
#########################################

if [[ $INPUT_COMMAND = "$COMMAND_BUILD" ]]; then
  build_container_image

elif [[ $INPUT_COMMAND = "$COMMAND_REBUILD" ]]; then
  build_container_image "no-cache"

elif [[ $INPUT_COMMAND = "$COMMAND_RUN" ]]; then
  docker compose up -d

elif [[ $INPUT_COMMAND = "$COMMAND_UPDATE" ]]; then
  process_update

elif [[ $INPUT_COMMAND = "$COMMAND_RESTART" ]]; then
  docker compose restart

elif [[ $INPUT_COMMAND = "$COMMAND_STOP" ]]; then
  docker compose down

else
    printf "ERROR: No matching command found. Please provide one of the following commands:\n%s, %s, %s, %s, %s, %s\n" "$COMMAND_BUILD" "$COMMAND_REBUILD" "$COMMAND_RUN" "$COMMAND_UPDATE" "$COMMAND_RESTART" "$COMMAND_STOP"
    exit 1
fi
