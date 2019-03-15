import { DescriptiveHeader } from '../core/stuff';
import * as React from 'react';
import { FormPanel } from '../core/form-panel/form-panel';
import { ExamplesLoader } from '../loaders/example-catalog-loader';
import { ExamplePicker, ExamplePickerValue } from '../pickers/example-picker';
import { FormHub } from '../core/types';
import { Button, EmptyState, EmptyStateBody, Title } from '@patternfly/react-core';
import { OverviewComplete } from '../core/hub-n-spoke/overview-complete';

export interface ExampleFormValue {
  examplePickerValue?: ExamplePickerValue;
}

export const ExampleHub: FormHub<ExampleFormValue> = {
  checkCompletion: value => !!value.examplePickerValue && ExamplePicker.checkCompletion(value.examplePickerValue),
  Overview: props => {
    if (!ExampleHub.checkCompletion(props.value)) {
      return (
        <EmptyState>
          <Title size="lg">You need to select a Example</Title>
          <EmptyStateBody>
            You will be able to have an entire application running in a few seconds...
          </EmptyStateBody>
          <Button variant="primary" onClick={props.onClick}>Select an Example</Button>
        </EmptyState>
      );
    }
    return (
      <ExamplesLoader query={{missionId: props.value.examplePickerValue!.missionId, runtimeId: props.value.examplePickerValue!.runtimeId}}>
        {result => (
          <OverviewComplete title={`Your example will be ${result.name} using:`}>
            <img src={result.runtime[0].icon} style={{margin: '5px auto', height: '160px'}}/>
          </OverviewComplete>
        )}
      </ExamplesLoader>
    );
  },
  Form: props => (
    <FormPanel
      initialValue={props.initialValue}
      validator={ExampleHub.checkCompletion}
      onSave={props.onSave}
      onCancel={props.onCancel}
    >
      {
        (inputProps) => (
          <React.Fragment>
            <DescriptiveHeader
              description="Select the use case that you want an Example of.
                        Once the use case is selected you can select the runtime implementation"
            />
            <ExamplesLoader>
              {catalog => (
                <ExamplePicker.Element
                  value={inputProps.value.examplePickerValue || {}}
                  onChange={(examplePickerValue) => inputProps.onChange({...inputProps.value, examplePickerValue})}
                  catalog={catalog}
                />
              )}
            </ExamplesLoader>
          </React.Fragment>
        )}
    </FormPanel>
  )
};
