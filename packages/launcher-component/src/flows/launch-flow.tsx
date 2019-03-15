import React, { useEffect, useState } from 'react';
import { Button, Toolbar, ToolbarGroup } from '@patternfly/react-core';
import { LaunchAppPayload, StatusMessage } from 'launcher-client';

import { useLauncherClient } from '../contexts/launcher-client-context';
import { ProcessingApp } from '../misc/processing-app';
import { LaunchNextSteps } from '../misc/launch-next-steps';
import { DownloadNextSteps } from '../misc/download-next-steps';
import { HubNSpoke } from '../core/hub-n-spoke';
import { DownloadIcon, ErrorCircleOIcon, PlaneDepartureIcon } from '@patternfly/react-icons';
import style from './launch-flow.module.scss';

enum Status {
  EDITION = 'EDITION', RUNNING = 'RUNNING', COMPLETED = 'COMPLETED', ERROR = 'ERROR', DOWNLOADED = 'DOWNLOADED'
}

export function useAutoSetCluster(setApp) {
  const client = useLauncherClient();
  const [showDeploymentForm, setShowDeploymentForm] = useState(true);
  useEffect(() => {
    client.ocClusters().then(c => {
      if (c.length === 1 && c[0].connected) {
        setShowDeploymentForm(false);
        setApp((prev) => ({...prev, deployment: {clusterPickerValue: {clusterId: c[0].id}}}));
      }
    });
  }, []);
  return showDeploymentForm;
}

interface RunState {
  status: Status;
  result?: any;
  error?: any;
  statusMessages: StatusMessage[];
}

interface LaunchFlowProps {
  title: string;
  items: any[];
  hint?: string;
  isReadyForLaunch: boolean;
  isReadyForDownload: boolean;
  buildAppPayload: () => LaunchAppPayload;
  onCancel?: () => void;
  canDownload?: boolean;
}

export function LaunchFlow(props: LaunchFlowProps) {
  const [run, setRun] = useState<RunState>({status: Status.EDITION, statusMessages: []});
  const client = useLauncherClient();
  const canDownload = props.canDownload === undefined || props.canDownload;
  const onCancel = props.onCancel || (() => {
  });
  const launch = () => {
    if (!props.isReadyForLaunch) {
      throw new Error('Launch must not be called when app is not ready!');
    }

    setRun({status: Status.RUNNING, statusMessages: []});

    client.launch(props.buildAppPayload()).then((result) => {
      setRun((prev) => ({...prev, result}));
      client.follow(result.id, result.events, {
        onMessage: (statusMessages) => {
          setRun((prev) => ({...prev, statusMessages: [...prev.statusMessages, statusMessages]}));
        },
        onComplete: () => {
          setRun((prev) => ({...prev, status: Status.COMPLETED}));
        },
        onError: (error) => {
          setRun((prev) => ({...prev, status: Status.ERROR, error}));
        }
      });
    }).catch(error => {
      setRun((prev) => ({...prev, status: Status.ERROR, error}));
    });
  };

  const download = () => {
    if (!props.isReadyForDownload) {
      throw new Error('Download must not be called when app is not ready!');
    }

    setRun({status: Status.RUNNING, statusMessages: []});

    client.download(props.buildAppPayload()).then((result) => {
      setRun((prev) => ({...prev, result, status: Status.DOWNLOADED}));
    }).catch(error => {
      setRun((prev) => ({...prev, status: Status.ERROR, error}));
    });
  };

  const toolbar = (
    <Toolbar className={style.toolbar}>
      <ToolbarGroup className={style.toolbarGroup}>
        <Button variant="primary" onClick={launch} className={style.toolbarButton} isDisabled={!props.isReadyForLaunch}>
          <PlaneDepartureIcon className={style.buttonIcon}/>Launch
        </Button>
        {canDownload && (
          <Button variant="primary" onClick={download} className={style.toolbarButton} isDisabled={!props.isReadyForDownload}>
            <DownloadIcon className={style.buttonIcon}/>Download
          </Button>
        )}
        <Button variant="secondary" onClick={props.onCancel} className={style.toolbarButton}>
          <ErrorCircleOIcon className={style.buttonIcon}/>Cancel
        </Button>
      </ToolbarGroup>

    </Toolbar>
  );

  const progressEvents = run.status === Status.RUNNING && run.result && run.result.events;
  const progressEventsResults = run.status === Status.RUNNING && run.result && run.statusMessages;

  const links = run.statusMessages.filter(m => m.data).map(m => {
    if (m.data!.routes) {
      return m.data!.routes;
    }
    return {[m.statusMessage]: m.data!.location};
  })!.reduce(
    (map, obj) => {
      const key = Object.keys(obj)[0];
      map[key] = obj[key];
      return map;
    }, {}
  );

  const goBackToEdition = () => setRun({status: Status.EDITION, statusMessages: []});

  return (
    <React.Fragment>
      <HubNSpoke title={props.title} items={props.items} toolbar={toolbar} error={run.error} hint={props.hint}/>
      {run.status === Status.RUNNING && (
        <ProcessingApp progressEvents={progressEvents} progressEventsResults={progressEventsResults}/>)}
      {run.status === Status.COMPLETED && (<LaunchNextSteps links={links} onClose={onCancel}/>)}
      {run.status === Status.DOWNLOADED && (<DownloadNextSteps onClose={goBackToEdition} downloadLink={run.result.downloadLink}/>)}
    </React.Fragment>
  );
}
