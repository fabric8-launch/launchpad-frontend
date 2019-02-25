import * as React from 'react';

import { DescriptiveHeader } from '../core/descriptive-header';
import { FormPanel } from '../core/form-panel/form-panel';
import { RepositoryPickerValue, defaultRepoPickerValue, RepositoryPicker } from '../pickers/repository-picker/repository-picker';
import { BuildImageValue, defaultBuidImagePickerValue, BuildImagePicker } from '../pickers/buildimage-picker/buildimage-picker';
import { GitInfoLoader } from '../loaders/git-info-loader';
import { BuildImageAnalyzerLoader } from '../loaders/buildimage-loader';

export interface ImportFormValue {
  repository: RepositoryPickerValue;
  buildImage: BuildImageValue;
}

export function isImportFormValueValid(value: ImportFormValue) {
  return !!value.repository.name && !!value.buildImage.imageName;
}

export const defaultImportFormValue: ImportFormValue = {
  repository: defaultRepoPickerValue,
  buildImage: defaultBuidImagePickerValue
};

interface ImportFormProps {
  value: ImportFormValue;

  onSave?(value: ImportFormValue);
  onCancel?();
}

export function ImportForm(props: ImportFormProps) {
  return (
    <FormPanel
      value={props.value}
      onSave={props.onSave}
      isValid={isImportFormValueValid}
      onCancel={props.onCancel}
    >
      {
        (inputProps) => (
          <React.Fragment>
            <DescriptiveHeader
              title="Source Location"
              description="You can select where your application source code will be located,
               for now the only available provider is GitHub."
            />
            <GitInfoLoader>
              {(gitInfo) => (
                <RepositoryPicker
                  import={true}
                  gitInfo={gitInfo}
                  value={inputProps.value.repository}
                  onChange={(repository) => inputProps.onChange({...inputProps.value, repository})}
                />
              )}
            </GitInfoLoader>
            {inputProps.value.repository.name && (
              <React.Fragment>
                <DescriptiveHeader
                  title="Build Image"
                  description="A build image is needed to build and deploy you app on openshift.
                  we've detected a likly canditate for you to use but you could change it if you need."
                />
                <BuildImageAnalyzerLoader repository={{org: 'jean-bon', name: 'bayonne'}}>
                  {result => (
                    <BuildImagePicker
                      value={inputProps.value.buildImage}
                      onChange={(buildImage) => inputProps.onChange({...inputProps.value, buildImage})}
                      result={result}
                    />
                  )}
                </BuildImageAnalyzerLoader>
              </React.Fragment>
            )}
          </React.Fragment>
        )}
    </FormPanel>
  );
}
