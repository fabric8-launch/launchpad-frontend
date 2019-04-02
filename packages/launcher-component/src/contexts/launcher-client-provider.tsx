import React, { useState } from 'react';
import { LauncherClientContext } from './launcher-client-context';
import { AuthorizationTokenProvider, cachedLauncherClient, checkNotNull, LauncherClient, mockLauncherClient } from 'launcher-client';

interface LauncherClientProviderProps {
  children: React.ReactNode;
  client?: LauncherClient;
  creatorUrl?: string;
  launcherUrl?: string;
  authorizationTokenProvider?: AuthorizationTokenProvider;
}

function buildLauncherClient(props: LauncherClientProviderProps) {
  if(props.client) {
    return props.client;
  }
  let client: LauncherClient;
  if (!!props.creatorUrl || !!props.launcherUrl) {
    checkNotNull(props.launcherUrl, 'launcherUrl');
    checkNotNull(props.creatorUrl, 'creatorUrl');
    client = cachedLauncherClient({creatorUrl: props.creatorUrl!, launcherURL: props.launcherUrl!});
  } else {
    client = mockLauncherClient();
  }
  return client;
}

export function LauncherClientProvider(props: LauncherClientProviderProps) {
  const [client] = useState<LauncherClient>(buildLauncherClient(props));

  if (props.authorizationTokenProvider) {
    client.authorizationTokenProvider = props.authorizationTokenProvider;
  }

  return (
    <LauncherClientContext.Provider value={client}>
      {props.children}
    </LauncherClientContext.Provider>
  );
}
