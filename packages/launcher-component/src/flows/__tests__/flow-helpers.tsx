import { act, fireEvent } from 'react-testing-library';
import { waitForTick } from 'launcher-client';

export async function flushPromises() {
// FIXME: use the new await version when it's available https://github.com/facebook/react/pull/14853
  act(() => {
    console.log('runAllTick()');
    jest.runAllTicks();
    jest.runOnlyPendingTimers();
    jest.runAllImmediates();
  });
  await waitForTick('act()');
}

export async function launchCheckPayloadAndProgress(comp, mockClient) {
  fireEvent.click(comp.getByLabelText('Launch Application'));

  expect(comp.getByLabelText('Waiting for server response...')).toBeDefined();

  expect(mockClient.currentPayload).toMatchSnapshot('payload');

  // Resolve launch result
  await flushPromises();

  expect(comp.getByLabelText('Receiving launch progress events...')).toBeDefined();
  expect(comp.getByLabelText('GITHUB_CREATE is in-progress')).toBeDefined();
  expect(comp.getByLabelText('GITHUB_PUSHED is in-progress')).toBeDefined();
  expect(comp.getByLabelText('OPENSHIFT_CREATE is in-progress')).toBeDefined();
  expect(comp.getByLabelText('OPENSHIFT_PIPELINE is in-progress')).toBeDefined();
  expect(comp.getByLabelText('GITHUB_WEBHOOK is in-progress')).toBeDefined();

  // Resolve GITHUB_CREATE
  await flushPromises();

  expect(comp.getByLabelText('GITHUB_CREATE is completed')).toBeDefined();

  // Resolve GITHUB_PUSHED
  await flushPromises();
  expect(comp.getByLabelText('GITHUB_PUSHED is completed')).toBeDefined();

  // Resolve OPENSHIFT_CREATE
  await flushPromises();
  expect(comp.getByLabelText('OPENSHIFT_CREATE is completed')).toBeDefined();

  // Resolve OPENSHIFT_PIPELINE
  await flushPromises();
  expect(comp.getByLabelText('OPENSHIFT_PIPELINE is completed')).toBeDefined();

  // Resolve GITHUB_WEBHOOK
  await flushPromises();
  expect(comp.getByLabelText('GITHUB_WEBHOOK is completed')).toBeDefined();

  // Resolve complete progress
  await flushPromises();
}
