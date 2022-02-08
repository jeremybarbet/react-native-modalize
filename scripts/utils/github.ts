import { readFileSync } from 'fs';

import { name as actionName } from '../../package.json';

type EventName = 'push' | 'pull_request' | 'workflow_dispatch' | 'pull_request_target';
export type Context = ReturnType<typeof getContext>;

const { GITHUB_EVENT_NAME, GITHUB_EVENT_PATH } = process.env;

const parseEnvFile = (eventPath: string) => {
  const eventBuffer = readFileSync(eventPath);

  return JSON.parse(eventBuffer as unknown as string);
};

const parseBranch = (eventName: EventName, event: any) => {
  if (eventName === 'push' || eventName === 'workflow_dispatch') {
    return event.ref.substring(11); // Remove "refs/heads/" from start of string
  }

  if (eventName === 'pull_request' || eventName === 'pull_request_target') {
    return event.pull_request.head.ref;
  }

  throw Error(`${actionName} does not support "${eventName as string}" GitHub events`);
};

export const getContext = (): { branch: string; eventName: EventName } => {
  const eventName = GITHUB_EVENT_NAME!;
  const eventPath = GITHUB_EVENT_PATH!;
  const event = parseEnvFile(eventPath);

  return {
    branch: parseBranch(eventName as EventName, event),
    eventName: eventName as EventName,
  };
};
