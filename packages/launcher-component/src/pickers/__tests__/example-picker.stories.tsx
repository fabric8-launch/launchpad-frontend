import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { FormPanel } from '../../core/form-panel/form-panel';

import { ExamplePicker } from '../example-picker';
import { ExamplesLoader } from '../../loaders/example-catalog-loader';
import { LauncherClientProvider } from '../../contexts/launcher-client-provider';

storiesOf('Pickers', module)
  .addDecorator((storyFn) => (
    <LauncherClientProvider>
      {storyFn()}
    </LauncherClientProvider>
  ))
  .add('ExamplePicker', () => {
    return (
      <ExamplesLoader>
        {catalog => (
          <FormPanel
            initialValue={{}}
            validator={ExamplePicker.checkCompletion}
            onSave={action('save')}
            onCancel={action('cancel')}
          >
            {(inputProps) => (<ExamplePicker.Element {...inputProps} {...catalog}/>)}
          </FormPanel>
        )}
      </ExamplesLoader>
    );
  });
