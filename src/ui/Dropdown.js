/* @flow */
import React from 'react';
import autobind from 'class-autobind';
import cx from 'classnames';

// $FlowIssue - Flow doesn't understand CSS Modules
import styles from './Dropdown.css';

type Props = {
  choices: Map<string, string>;
  selectedKey: ?string;
  onChange: (selectedKey: string) => any;
  className?: string;
};

export default class Dropdown extends React.Component {
  props: Props;

  constructor() {
    super(...arguments);
    autobind(this);
  }

  render(): React.Element {
    let {choices, selectedKey, className, ...otherProps} = this.props;
    className = cx(className, styles.root);
    let selectedValue = (selectedKey == null) ? '' : choices.get(selectedKey);
    return (
      <span className={className} title={selectedValue}>
        <select {...otherProps} value={selectedKey} onChange={this._onChange}>
          {this._renderChoices()}
        </select>
        <span className={styles.value}>{selectedValue}</span>
      </span>
    );
  }

  _onChange(event: Object) {
    let value: string = event.target.value;
    this.props.onChange(value);
  }

  _renderChoices(): Array<React.Element> {
    let {choices} = this.props;
    let entries = Array.from(choices.entries());
    return entries.map(([key, text]) => (
      <option key={key} value={key}>{text}</option>
    ));
  }
}
