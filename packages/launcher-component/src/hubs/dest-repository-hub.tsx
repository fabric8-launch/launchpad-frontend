import * as React from 'react';
import { generate } from 'project-name-generator';
import { UserRepositoryPicker, UserRepositoryPickerValue, valueToPath } from '../pickers/user-repository-picker';
import { DescriptiveHeader, SpecialValue } from '../core/stuff';
import { GitInfoLoader } from '../loaders/git-info-loader';
import { FormPanel } from '../core/form-panel/form-panel';
import { FormHub } from '../core/types';
import { Button, EmptyState, EmptyStateBody, Title } from '@patternfly/react-core';
import { OverviewComplete } from '../core/hub-n-spoke/overview-complete';

export interface DestRepositoryFormValue {
  userRepositoryPickerValue?: UserRepositoryPickerValue;
}

export function createDestRepositoryFormValueWithGeneratedName() {
  return { userRepositoryPickerValue: {name: generate().dashed}};
}

export const DestRepositoryHub: FormHub<DestRepositoryFormValue> = {
  checkCompletion: value => !!value.userRepositoryPickerValue && UserRepositoryPicker.checkCompletion(value.userRepositoryPickerValue),
  Overview: props => {
    if (!DestRepositoryHub.checkCompletion(props.value)) {
      return (
        <EmptyState>
          <Title size="lg">You can select where your application code will be located.</Title>
          <EmptyStateBody>
            You will be able to choose a repository provider and a location...
          </EmptyStateBody>
          <Button variant="primary" onClick={props.onClick}>Select Destination Repository</Button>
        </EmptyState>
      );
    }
    return (
      <OverviewComplete title={`Destination Repository is configured'`}>
        You selected <SpecialValue>{valueToPath(props.value.userRepositoryPickerValue!)}</SpecialValue> as destination repository.
      </OverviewComplete>
    );
  },
  Form: props => (
    <FormPanel
      initialValue={props.initialValue}
      validator={DestRepositoryHub.checkCompletion}
      onSave={props.onSave}
      onCancel={props.onCancel}
    >
      {
        (inputProps) => (
          <React.Fragment>
            <DescriptiveHeader
              description="You can select where your application source code will be located,
               for now the only available provider is GitHub."
            />
            <GitInfoLoader>
              {(gitInfo) => (
                <UserRepositoryPicker.Element
                  gitInfo={gitInfo}
                  value={inputProps.value.userRepositoryPickerValue || {}}
                  onChange={(userRepositoryPickerValue) => inputProps.onChange({...inputProps.value, userRepositoryPickerValue})}
                />
              )}
            </GitInfoLoader>
          </React.Fragment>
        )}
    </FormPanel>
  )
};
