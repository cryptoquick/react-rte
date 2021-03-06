/* @flow */
import React from 'react';
import IconButton from '../ui/IconButton';
import autobind from 'class-autobind';

type Props = {
  style: string;
  onToggle: (style: string) => any;
};

export default class StyleButton extends React.Component {
  props: Props;

  constructor() {
    super(...arguments);
    autobind(this);
  }

  render(): React.Element {
    let {style, onToggle, ...otherProps} = this.props; // eslint-disable-line no-unused-vars
    let iconName = style.toLowerCase();
    // `focusOnClick` will prevent the editor from losing focus when a control
    // button is clicked.
    return (
      <IconButton
        {...otherProps}
        iconName={iconName}
        onClick={this._onClick}
        focusOnClick={false}
      />
    );
  }

  _onClick() {
    this.props.onToggle(this.props.style);
  }
}
