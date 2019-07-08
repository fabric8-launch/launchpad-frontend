import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { FormPanel } from '../../core/form-panel/form-panel';

import { MavenSettingsPicker } from '../maven-settings-picker';

afterEach(cleanup);

describe('<MavenSettingsPicker />', () => {
  it('renders the MavenSettingsPicker correctly', () => {
    const comp = render(<MavenSettingsPicker.Element value={{groupId: '', version: '', artifactId: ''}} onChange={() => {}}/>);
    expect(comp.asFragment()).toMatchSnapshot();
  });

  it('show error for invalid data', () => {
    const handleSave = jest.fn();
    const comp = render(
      <FormPanel
        initialValue={{}}
        validator={MavenSettingsPicker.checkCompletion}
        onSave={handleSave}
        onCancel={() => {}}
      >
        {(inputProps) => (<MavenSettingsPicker.Element {...inputProps} showMoreOptions />)}
      </FormPanel>
    );

    const groupIdField = comp.getByLabelText('Maven groupId name');
    fireEvent.change(groupIdField, { target: { value: 'invalid name' } });
    const artifactIdField = comp.getByLabelText('Maven artifactId name');
    fireEvent.change(artifactIdField, { target: { value: 'invalid name' } });
    const toggleButton = comp.getByLabelText('Expand panel');
    fireEvent.click(toggleButton);
    const versionField = comp.getByLabelText('Maven version number');
    fireEvent.change(versionField, { target: { value: '1' } });
    expect(comp.asFragment()).toMatchSnapshot();
  });
});
