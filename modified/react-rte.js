import React from 'react';
import Draft from 'draft-js';
const { RichUtils, EditorState, Modifier, Editor, CompositeDecorator, Entity, ContentBlock, genKey, CharacterMetadata } = Draft;
import getDefaultKeyBinding from 'draft-js/lib/getDefaultKeyBinding';
import DraftUtils from 'draft-js-utils';
const { BLOCK_TYPE, ENTITY_TYPE } = DraftUtils;
import isSoftNewlineEvent from 'draft-js/lib/isSoftNewlineEvent';
import KeyBindingUtil from 'draft-js/lib/KeyBindingUtil';
const { hasCommandModifier } = KeyBindingUtil;
import ReactDOM from 'react-dom';
import cx from 'classnames';
import autobind from 'class-autobind';
import ExportHTML from 'draft-js-export-html';
const { stateToHTML } = ExportHTML;
import ImportHTML from 'draft-js-import-html';
const { stateFromHTML } = ImportHTML;
import ExportMarkdown from 'draft-js-export-markdown';
const { stateToMarkdown } = ExportMarkdown;
import ImportMarkdown from 'draft-js-import-markdown';
const { stateFromMarkdown } = ImportMarkdown;
import EventEmitter from 'eventemitter2';
import './external-helpers';

function changeBlockDepth(editorState, blockKey, newDepth) {
  var content = editorState.getCurrentContent();
  var block = content.getBlockForKey(blockKey);
  var depth = block.getDepth();
  if (depth === newDepth) {
    return editorState;
  }
  var newBlock = block.set('depth', newDepth);
  var newContent = content.merge({
    blockMap: content.getBlockMap().set(blockKey, newBlock)
  });
  return EditorState.push(editorState, newContent, 'adjust-depth');
}

function changeBlockType(editorState, blockKey, newType) {
  var content = editorState.getCurrentContent();
  var block = content.getBlockForKey(blockKey);
  var type = block.getType();
  if (type === newType) {
    return editorState;
  }
  var newBlock = block.set('type', newType);
  var newContent = content.merge({
    blockMap: content.getBlockMap().set(blockKey, newBlock)
  });
  return EditorState.push(editorState, newContent, 'change-block-type');
}

function insertBlockAfter(editorState, blockKey, newType) {
  var content = editorState.getCurrentContent();
  var blockMap = content.getBlockMap();
  var block = blockMap.get(blockKey);
  var blocksBefore = blockMap.toSeq().takeUntil(function (v) {
    return v === block;
  });
  var blocksAfter = blockMap.toSeq().skipUntil(function (v) {
    return v === block;
  }).rest();
  var newBlockKey = genKey();
  var newBlock = new ContentBlock({
    key: newBlockKey,
    type: newType,
    text: '',
    characterList: block.getCharacterList().slice(0, 0),
    depth: 0
  });
  var newBlockMap = blocksBefore.concat([[blockKey, block], [newBlockKey, newBlock]], blocksAfter).toOrderedMap();
  var selection = editorState.getSelection();
  var newContent = content.merge({
    blockMap: newBlockMap,
    selectionBefore: selection,
    selectionAfter: selection.merge({
      anchorKey: newBlockKey,
      anchorOffset: 0,
      focusKey: newBlockKey,
      focusOffset: 0,
      isBackward: false
    })
  });
  return EditorState.push(editorState, newContent, 'split-block');
}

function isListItem(block) {
  var blockType = block.getType();
  return blockType === BLOCK_TYPE.UNORDERED_LIST_ITEM || blockType === BLOCK_TYPE.ORDERED_LIST_ITEM;
}

var INLINE_STYLE_BUTTONS = [{ label: 'Bold', style: 'BOLD' }, { label: 'Italic', style: 'ITALIC' }, { label: 'Strikethrough', style: 'STRIKETHROUGH' }, { label: 'Monospace', style: 'CODE' }];

var BLOCK_TYPE_DROPDOWN = [{ label: 'Normal', style: 'unstyled' }, { label: 'Heading Large', style: 'header-one' }, { label: 'Heading Medium', style: 'header-two' }, { label: 'Heading Small', style: 'header-three' }, { label: 'Code Block', style: 'code-block' }];
var BLOCK_TYPE_BUTTONS = [{ label: 'UL', style: 'unordered-list-item' }, { label: 'OL', style: 'ordered-list-item' }, { label: 'Blockquote', style: 'blockquote' }];

var styles = {
  "root": "mc7eb231c3_root"
};

// TODO: Use a more specific type here.


var Button = function (_React$Component) {
  babelHelpers.inherits(Button, _React$Component);

  function Button() {
    babelHelpers.classCallCheck(this, Button);

    var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Button).apply(this, arguments));

    autobind(_this);
    return _this;
  }

  babelHelpers.createClass(Button, [{
    key: 'render',
    value: function render() {
      var props = this.props;
      var className = props.className;
      var isDisabled = props.isDisabled;
      var focusOnClick = props.focusOnClick;
      var formSubmit = props.formSubmit;
      var otherProps = babelHelpers.objectWithoutProperties(props, ['className', 'isDisabled', 'focusOnClick', 'formSubmit']);

      className = cx(className, styles.root);
      var onMouseDown = focusOnClick === false ? this._onMouseDownPreventDefault : props.onMouseDown;
      var type = formSubmit ? 'submit' : 'button';
      return React.createElement(
        'button',
        babelHelpers.extends({ type: type }, otherProps, { onMouseDown: onMouseDown, className: className, disabled: isDisabled }),
        props.children
      );
    }
  }, {
    key: '_onMouseDownPreventDefault',
    value: function _onMouseDownPreventDefault(event) {
      event.preventDefault();
      var onMouseDown = this.props.onMouseDown;

      if (onMouseDown != null) {
        onMouseDown(event);
      }
    }
  }]);
  return Button;
}(React.Component);

var styles$1 = {
    "root": "mc842710d1_root"
};

function ButtonWrap(props) {
  var className = cx(props.className, styles$1.root);
  return React.createElement('div', babelHelpers.extends({}, props, { className: className }));
}

var styles$2 = {
    "root": "mcbb085a95_root",
    "icon": "mcbb085a95_icon",
    "isActive": "mcbb085a95_isActive",
    "icon-undo": "mcbb085a95_icon mcbb085a95_icon-undo",
    "icon-redo": "mcbb085a95_icon mcbb085a95_icon-redo",
    "icon-unordered-list-item": "mcbb085a95_icon mcbb085a95_icon-unordered-list-item",
    "icon-ordered-list-item": "mcbb085a95_icon mcbb085a95_icon-ordered-list-item",
    "icon-blockquote": "mcbb085a95_icon mcbb085a95_icon-blockquote",
    "icon-bold": "mcbb085a95_icon mcbb085a95_icon-bold",
    "icon-italic": "mcbb085a95_icon mcbb085a95_icon-italic",
    "icon-underline": "mcbb085a95_icon mcbb085a95_icon-underline",
    "icon-strikethrough": "mcbb085a95_icon mcbb085a95_icon-strikethrough",
    "icon-code": "mcbb085a95_icon mcbb085a95_icon-code",
    "icon-link": "mcbb085a95_icon mcbb085a95_icon-link",
    "icon-remove-link": "mcbb085a95_icon mcbb085a95_icon-remove-link",
    "icon-cancel": "mcbb085a95_icon mcbb085a95_icon-cancel",
    "icon-accept": "mcbb085a95_icon mcbb085a95_icon-accept"
};

// TODO: Use a more specific type here.


var IconButton = function (_React$Component) {
  babelHelpers.inherits(IconButton, _React$Component);

  function IconButton() {
    babelHelpers.classCallCheck(this, IconButton);
    return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(IconButton).apply(this, arguments));
  }

  babelHelpers.createClass(IconButton, [{
    key: 'render',
    value: function render() {
      var _cx;

      var props = this.props;
      var className = props.className;
      var iconName = props.iconName;
      var label = props.label;
      var children = props.children;
      var isActive = props.isActive;
      var otherProps = babelHelpers.objectWithoutProperties(props, ['className', 'iconName', 'label', 'children', 'isActive']);

      className = cx(className, (_cx = {}, babelHelpers.defineProperty(_cx, styles$2.root, true), babelHelpers.defineProperty(_cx, styles$2.isActive, isActive), _cx));
      return React.createElement(
        ButtonWrap,
        null,
        React.createElement(
          Button,
          babelHelpers.extends({}, otherProps, { title: label, className: className }),
          React.createElement('span', { className: styles$2['icon-' + iconName] })
        ),
        children
      );
    }
  }]);
  return IconButton;
}(React.Component);

var StyleButton = function (_React$Component) {
  babelHelpers.inherits(StyleButton, _React$Component);

  function StyleButton() {
    babelHelpers.classCallCheck(this, StyleButton);

    var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(StyleButton).apply(this, arguments));

    autobind(_this);
    return _this;
  }

  babelHelpers.createClass(StyleButton, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var style = _props.style;
      var onToggle = _props.onToggle;
      var otherProps = babelHelpers.objectWithoutProperties(_props, ['style', 'onToggle']); // eslint-disable-line no-unused-vars

      var iconName = style.toLowerCase();
      // `focusOnClick` will prevent the editor from losing focus when a control
      // button is clicked.
      return React.createElement(IconButton, babelHelpers.extends({}, otherProps, {
        iconName: iconName,
        onClick: this._onClick,
        focusOnClick: false
      }));
    }
  }, {
    key: '_onClick',
    value: function _onClick() {
      this.props.onToggle(this.props.style);
    }
  }]);
  return StyleButton;
}(React.Component);

var styles$3 = {
    "root": "mcd6abed22_root"
};

function ButtonGroup(props_) {
  var className = cx(props_.className, styles$3.root);
  return React.createElement('div', babelHelpers.extends({}, props_, { className: className }));
}

var styles$4 = {
    "root": "mc2a1dde68_root",
    "inner": "mc2a1dde68_inner",
    "input": "mc2a1dde68_input",
    "buttonGroup": "mc2a1dde68_buttonGroup"
};

var InputPopover = function (_React$Component) {
  babelHelpers.inherits(InputPopover, _React$Component);

  function InputPopover() {
    babelHelpers.classCallCheck(this, InputPopover);

    var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(InputPopover).apply(this, arguments));

    autobind(_this);
    return _this;
  }

  babelHelpers.createClass(InputPopover, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      document.addEventListener('click', this._onDocumentClick);
      document.addEventListener('keydown', this._onDocumentKeydown);
      if (this._inputRef) {
        this._inputRef.focus();
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      document.removeEventListener('click', this._onDocumentClick);
      document.removeEventListener('keydown', this._onDocumentKeydown);
    }
  }, {
    key: 'render',
    value: function render() {
      var props = this.props;

      var className = cx(props.className, styles$4.root);
      return React.createElement(
        'div',
        { className: className },
        React.createElement(
          'div',
          { className: styles$4.inner },
          React.createElement('input', {
            ref: this._setInputRef,
            type: 'text',
            placeholder: 'https://example.com/',
            className: styles$4.input,
            onKeyPress: this._onInputKeyPress
          }),
          React.createElement(
            ButtonGroup,
            { className: styles$4.buttonGroup },
            React.createElement(IconButton, {
              label: 'Cancel',
              iconName: 'cancel',
              onClick: props.onCancel
            }),
            React.createElement(IconButton, {
              label: 'Submit',
              iconName: 'accept',
              onClick: this._onSubmit
            })
          )
        )
      );
    }
  }, {
    key: '_setInputRef',
    value: function _setInputRef(inputElement) {
      this._inputRef = inputElement;
    }
  }, {
    key: '_onInputKeyPress',
    value: function _onInputKeyPress(event) {
      if (event.which === 13) {
        // Avoid submitting a <form> somewhere up the element tree.
        event.preventDefault();
        this._onSubmit();
      }
    }
  }, {
    key: '_onSubmit',
    value: function _onSubmit() {
      var value = this._inputRef ? this._inputRef.value : '';
      this.props.onSubmit(value);
    }
  }, {
    key: '_onDocumentClick',
    value: function _onDocumentClick(event) {
      var rootNode = ReactDOM.findDOMNode(this);
      if (!rootNode.contains(event.target)) {
        // Here we pass the event so the parent can manage focus.
        this.props.onCancel(event);
      }
    }
  }, {
    key: '_onDocumentKeydown',
    value: function _onDocumentKeydown(event) {
      if (event.keyCode === 27) {
        this.props.onCancel();
      }
    }
  }]);
  return InputPopover;
}(React.Component);

var PopoverIconButton = function (_React$Component) {
  babelHelpers.inherits(PopoverIconButton, _React$Component);

  function PopoverIconButton() {
    babelHelpers.classCallCheck(this, PopoverIconButton);

    var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(PopoverIconButton).apply(this, arguments));

    autobind(_this);
    return _this;
  }

  babelHelpers.createClass(PopoverIconButton, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var onTogglePopover = _props.onTogglePopover;
      var showPopover = _props.showPopover;
      var props = babelHelpers.objectWithoutProperties(_props, ['onTogglePopover', 'showPopover']); // eslint-disable-line no-unused-vars

      return React.createElement(
        IconButton,
        babelHelpers.extends({}, props, { onClick: onTogglePopover }),
        this._renderPopover()
      );
    }
  }, {
    key: '_renderPopover',
    value: function _renderPopover() {
      if (!this.props.showPopover) {
        return null;
      }
      return React.createElement(InputPopover, {
        onSubmit: this._onSubmit,
        onCancel: this._hidePopover
      });
    }
  }, {
    key: '_onSubmit',
    value: function _onSubmit() {
      var _props2;

      (_props2 = this.props).onSubmit.apply(_props2, arguments);
    }
  }, {
    key: '_hidePopover',
    value: function _hidePopover() {
      if (this.props.showPopover) {
        var _props3;

        (_props3 = this.props).onTogglePopover.apply(_props3, arguments);
      }
    }
  }]);
  return PopoverIconButton;
}(React.Component);

var styles$5 = {
    "root": "mc4781537a_root",
    "value": "mc4781537a_value"
};

var Dropdown = function (_React$Component) {
  babelHelpers.inherits(Dropdown, _React$Component);

  function Dropdown() {
    babelHelpers.classCallCheck(this, Dropdown);

    var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(Dropdown).apply(this, arguments));

    autobind(_this);
    return _this;
  }

  babelHelpers.createClass(Dropdown, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var choices = _props.choices;
      var selectedKey = _props.selectedKey;
      var className = _props.className;
      var otherProps = babelHelpers.objectWithoutProperties(_props, ['choices', 'selectedKey', 'className']);

      className = cx(className, styles$5.root);
      var selectedValue = selectedKey == null ? '' : choices.get(selectedKey);
      return React.createElement(
        'span',
        { className: className, title: selectedValue },
        React.createElement(
          'select',
          babelHelpers.extends({}, otherProps, { value: selectedKey, onChange: this._onChange }),
          this._renderChoices()
        ),
        React.createElement(
          'span',
          { className: styles$5.value },
          selectedValue
        )
      );
    }
  }, {
    key: '_onChange',
    value: function _onChange(event) {
      var value = event.target.value;
      this.props.onChange(value);
    }
  }, {
    key: '_renderChoices',
    value: function _renderChoices() {
      var choices = this.props.choices;

      var entries = Array.from(choices.entries());
      return entries.map(function (_ref) {
        var _ref2 = babelHelpers.slicedToArray(_ref, 2);

        var key = _ref2[0];
        var text = _ref2[1];
        return React.createElement(
          'option',
          { key: key, value: key },
          text
        );
      });
    }
  }]);
  return Dropdown;
}(React.Component);

/*       */

function getEntityAtOffset(block, offset) {
  var entityKey = block.getEntityAt(offset);
  if (entityKey == null) {
    return null;
  }
  var startOffset = offset;
  while (startOffset > 0 && block.getEntityAt(startOffset - 1) === entityKey) {
    startOffset -= 1;
  }
  var endOffset = startOffset;
  var blockLength = block.getLength();
  while (endOffset < blockLength && block.getEntityAt(endOffset + 1) === entityKey) {
    endOffset += 1;
  }
  return {
    entityKey: entityKey,
    blockKey: block.getKey(),
    startOffset: startOffset,
    endOffset: endOffset + 1
  };
}

function getEntityAtCursor(editorState) {
  var selection = editorState.getSelection();
  var startKey = selection.getStartKey();
  var startBlock = editorState.getCurrentContent().getBlockForKey(startKey);
  var startOffset = selection.getStartOffset();
  if (selection.isCollapsed()) {
    // Get the entity before the cursor (unless the cursor is at the start).
    return getEntityAtOffset(startBlock, startOffset === 0 ? startOffset : startOffset - 1);
  }
  if (startKey !== selection.getEndKey()) {
    return null;
  }
  var endOffset = selection.getEndOffset();
  var startEntityKey = startBlock.getEntityAt(startOffset);
  for (var i = startOffset; i < endOffset; i++) {
    var entityKey = startBlock.getEntityAt(i);
    if (entityKey == null || entityKey !== startEntityKey) {
      return null;
    }
  }
  return {
    entityKey: startEntityKey,
    blockKey: startBlock.getKey(),
    startOffset: startOffset,
    endOffset: endOffset
  };
}

function clearEntityForRange(editorState, blockKey, startOffset, endOffset) {
  var contentState = editorState.getCurrentContent();
  var blockMap = contentState.getBlockMap();
  var block = blockMap.get(blockKey);
  var charList = block.getCharacterList();
  var newCharList = charList.map(function (char, i) {
    if (i >= startOffset && i < endOffset) {
      return CharacterMetadata.applyEntity(char, null);
    } else {
      return char;
    }
  });
  var newBlock = block.set('characterList', newCharList);
  var newBlockMap = blockMap.set(blockKey, newBlock);
  var newContentState = contentState.set('blockMap', newBlockMap);
  return EditorState.push(editorState, newContentState, 'apply-entity');
}

var styles$6 = {
    "root": "mc6bd30359_root"
};

var EditorToolbar = function (_React$Component) {
  babelHelpers.inherits(EditorToolbar, _React$Component);

  function EditorToolbar() {
    babelHelpers.classCallCheck(this, EditorToolbar);

    var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(EditorToolbar).apply(this, arguments));

    autobind(_this);
    _this.state = {
      showLinkInput: false
    };
    return _this;
  }

  babelHelpers.createClass(EditorToolbar, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      // Technically, we should also attach/detach event listeners when the
      // `keyEmitter` prop changes.
      this.props.keyEmitter.on('keypress', this._onKeypress);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.props.keyEmitter.removeListener('keypress', this._onKeypress);
    }
  }, {
    key: 'render',
    value: function render() {
      var className = this.props.className;

      return React.createElement(
        'div',
        { className: cx(styles$6.root, className) },
        this._renderInlineStyleButtons(),
        this._renderBlockTypeButtons(),
        this._renderLinkButtons(),
        this._renderBlockTypeDropdown(),
        this._renderUndoRedo()
      );
    }
  }, {
    key: '_renderBlockTypeDropdown',
    value: function _renderBlockTypeDropdown() {
      var blockType = this._getCurrentBlockType();
      var choices = new Map(BLOCK_TYPE_DROPDOWN.map(function (type) {
        return [type.style, type.label];
      }));
      if (!choices.has(blockType)) {
        blockType = Array.from(choices.keys())[0];
      }
      return React.createElement(
        ButtonGroup,
        null,
        React.createElement(Dropdown, {
          choices: choices,
          selectedKey: blockType,
          onChange: this._selectBlockType
        })
      );
    }
  }, {
    key: '_renderBlockTypeButtons',
    value: function _renderBlockTypeButtons() {
      var _this2 = this;

      var blockType = this._getCurrentBlockType();
      var buttons = BLOCK_TYPE_BUTTONS.map(function (type, index) {
        return React.createElement(StyleButton, {
          key: String(index),
          isActive: type.style === blockType,
          label: type.label,
          onToggle: _this2._toggleBlockType,
          style: type.style
        });
      });
      return React.createElement(
        ButtonGroup,
        null,
        buttons
      );
    }
  }, {
    key: '_renderInlineStyleButtons',
    value: function _renderInlineStyleButtons() {
      var _this3 = this;

      var editorState = this.props.editorState;

      var currentStyle = editorState.getCurrentInlineStyle();
      var buttons = INLINE_STYLE_BUTTONS.map(function (type, index) {
        return React.createElement(StyleButton, {
          key: String(index),
          isActive: currentStyle.has(type.style),
          label: type.label,
          onToggle: _this3._toggleInlineStyle,
          style: type.style
        });
      });
      return React.createElement(
        ButtonGroup,
        null,
        buttons
      );
    }
  }, {
    key: '_renderLinkButtons',
    value: function _renderLinkButtons() {
      var editorState = this.props.editorState;

      var selection = editorState.getSelection();
      var entity = this._getEntityAtCursor();
      var hasSelection = !selection.isCollapsed();
      var isCursorOnLink = entity != null && entity.type === ENTITY_TYPE.LINK;
      var shouldShowLinkButton = hasSelection || isCursorOnLink;
      return React.createElement(
        ButtonGroup,
        null,
        React.createElement(PopoverIconButton, {
          label: 'Link',
          iconName: 'link',
          isDisabled: !shouldShowLinkButton,
          showPopover: this.state.showLinkInput,
          onTogglePopover: this._toggleShowLinkInput,
          onSubmit: this._setLink
        }),
        React.createElement(IconButton, {
          label: 'Remove Link',
          iconName: 'remove-link',
          isDisabled: !isCursorOnLink,
          onClick: this._removeLink,
          focusOnClick: false
        })
      );
    }
  }, {
    key: '_renderUndoRedo',
    value: function _renderUndoRedo() {
      var editorState = this.props.editorState;

      var canUndo = editorState.getUndoStack().size !== 0;
      var canRedo = editorState.getRedoStack().size !== 0;
      return React.createElement(
        ButtonGroup,
        null,
        React.createElement(IconButton, {
          label: 'Undo',
          iconName: 'undo',
          isDisabled: !canUndo,
          onClick: this._undo,
          focusOnClick: false
        }),
        React.createElement(IconButton, {
          label: 'Redo',
          iconName: 'redo',
          isDisabled: !canRedo,
          onClick: this._redo,
          focusOnClick: false
        })
      );
    }
  }, {
    key: '_onKeypress',
    value: function _onKeypress(event, eventFlags) {
      // Catch cmd+k for use with link insertion.
      if (hasCommandModifier(event) && event.keyCode === 75) {
        // TODO: Ensure there is some text selected.
        this.setState({ showLinkInput: true });
        eventFlags.wasHandled = true;
      }
    }
  }, {
    key: '_toggleShowLinkInput',
    value: function _toggleShowLinkInput(event) {
      var isShowing = this.state.showLinkInput;
      // If this is a hide request, decide if we should focus the editor.
      if (isShowing) {
        var shouldFocusEditor = true;
        if (event && event.type === 'click') {
          // TODO: Use a better way to get the editor root node.
          var editorRoot = ReactDOM.findDOMNode(this).parentNode;
          var _document = document;
          var activeElement = _document.activeElement;

          var wasClickAway = activeElement == null || activeElement === document.body;
          if (!wasClickAway && !editorRoot.contains(activeElement)) {
            shouldFocusEditor = false;
          }
        }
        if (shouldFocusEditor) {
          this.props.focusEditor();
        }
      }
      this.setState({ showLinkInput: !isShowing });
    }
  }, {
    key: '_setLink',
    value: function _setLink(url) {
      var editorState = this.props.editorState;

      var selection = editorState.getSelection();
      var entityKey = Entity.create(ENTITY_TYPE.LINK, 'MUTABLE', { url: url });
      this.setState({ showLinkInput: false });
      this.props.onChange(RichUtils.toggleLink(editorState, selection, entityKey));
      this._focusEditor();
    }
  }, {
    key: '_removeLink',
    value: function _removeLink() {
      var editorState = this.props.editorState;

      var entity = getEntityAtCursor(editorState);
      if (entity != null) {
        var blockKey = entity.blockKey;
        var startOffset = entity.startOffset;
        var endOffset = entity.endOffset;

        this.props.onChange(clearEntityForRange(editorState, blockKey, startOffset, endOffset));
      }
    }
  }, {
    key: '_getEntityAtCursor',
    value: function _getEntityAtCursor() {
      var editorState = this.props.editorState;

      var entity = getEntityAtCursor(editorState);
      return entity == null ? null : Entity.get(entity.entityKey);
    }
  }, {
    key: '_getCurrentBlockType',
    value: function _getCurrentBlockType() {
      var editorState = this.props.editorState;

      var selection = editorState.getSelection();
      return editorState.getCurrentContent().getBlockForKey(selection.getStartKey()).getType();
    }
  }, {
    key: '_selectBlockType',
    value: function _selectBlockType() {
      this._toggleBlockType.apply(this, arguments);
      this._focusEditor();
    }
  }, {
    key: '_toggleBlockType',
    value: function _toggleBlockType(blockType) {
      this.props.onChange(RichUtils.toggleBlockType(this.props.editorState, blockType));
    }
  }, {
    key: '_toggleInlineStyle',
    value: function _toggleInlineStyle(inlineStyle) {
      this.props.onChange(RichUtils.toggleInlineStyle(this.props.editorState, inlineStyle));
    }
  }, {
    key: '_undo',
    value: function _undo() {
      var editorState = this.props.editorState;

      this.props.onChange(EditorState.undo(editorState));
    }
  }, {
    key: '_redo',
    value: function _redo() {
      var editorState = this.props.editorState;

      this.props.onChange(EditorState.redo(editorState));
    }
  }, {
    key: '_focusEditor',
    value: function _focusEditor() {
      var _this4 = this;

      // Hacky: Wait to focus the editor so we don't lose selection.
      setTimeout(function () {
        _this4.props.focusEditor();
      }, 50);
    }
  }]);
  return EditorToolbar;
}(React.Component);

var EditorValue = function () {
  function EditorValue(editorState) {
    var cache = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    babelHelpers.classCallCheck(this, EditorValue);

    this._cache = cache;
    this._editorState = editorState;
  }

  babelHelpers.createClass(EditorValue, [{
    key: 'getEditorState',
    value: function getEditorState() {
      return this._editorState;
    }
  }, {
    key: 'setEditorState',
    value: function setEditorState(editorState) {
      return this._editorState === editorState ? this : new EditorValue(editorState);
    }
  }, {
    key: 'toString',
    value: function toString(format) {
      var fromCache = this._cache[format];
      if (fromCache != null) {
        return fromCache;
      }
      return this._cache[format] = _toString(this.getEditorState(), format);
    }
  }, {
    key: 'setContentFromString',
    value: function setContentFromString(markup, format) {
      var editorState = EditorState.push(this._editorState, fromString(markup, format), 'secondary-paste');
      return new EditorValue(editorState, babelHelpers.defineProperty({}, format, markup));
    }
  }], [{
    key: 'createEmpty',
    value: function createEmpty(decorator) {
      var editorState = EditorState.createEmpty(decorator);
      return new EditorValue(editorState);
    }
  }, {
    key: 'createFromState',
    value: function createFromState(editorState) {
      return new EditorValue(editorState);
    }
  }, {
    key: 'createFromString',
    value: function createFromString(markup, format, decorator) {
      var contentState = fromString(markup, format);
      var editorState = EditorState.createWithContent(contentState, decorator);
      return new EditorValue(editorState, babelHelpers.defineProperty({}, format, markup));
    }
  }]);
  return EditorValue;
}();

function _toString(editorState, format) {
  var contentState = editorState.getCurrentContent();
  switch (format) {
    case 'html':
      {
        return stateToHTML(contentState);
      }
    case 'markdown':
      {
        return stateToMarkdown(contentState);
      }
    default:
      {
        throw new Error('Format not supported: ' + format);
      }
  }
}

function fromString(markup, format) {
  switch (format) {
    case 'html':
      {
        return stateFromHTML(markup);
      }
    case 'markdown':
      {
        return stateFromMarkdown(markup);
      }
    default:
      {
        throw new Error('Format not supported: ' + format);
      }
  }
}

// TODO: Use a more specific type here.


function Link(props_) {
  var _Entity$get$getData = Entity.get(props_.entityKey).getData();

  var url = _Entity$get$getData.url;

  return React.createElement(
    'a',
    { href: url },
    props_.children
  );
}

function findLinkEntities(contentBlock, callback) {
  contentBlock.findEntityRanges(function (character) {
    var entityKey = character.getEntity();
    return entityKey != null && Entity.get(entityKey).getType() === ENTITY_TYPE.LINK;
  }, callback);
}

var LinkDecorator = {
  strategy: findLinkEntities,
  component: Link
};

var styles$7 = {
    "root": "mc78a50fa9_root",
    "editor": "mc78a50fa9_editor",
    // "public-DraftEditorPlaceholder-root": "public-DraftEditorPlaceholder-root",
    // "public-DraftEditor-content": "public-DraftEditor-content",
    "hidePlaceholder": "mc78a50fa9_hidePlaceholder",
    "paragraph": "mc78a50fa9_paragraph",
    "codeBlock": "mc78a50fa9_codeBlock",
    "blockquote": "mc78a50fa9_blockquote",
    "block": "mc78a50fa9_block"
};

var MAX_LIST_DEPTH = 2;

// Custom overrides for "code" style.
var styleMap = {
  CODE: {
    backgroundColor: '#f3f3f3',
    fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
    fontSize: 16,
    padding: 2
  }
};

var RichTextEditor = function (_React$Component) {
  babelHelpers.inherits(RichTextEditor, _React$Component);

  function RichTextEditor() {
    babelHelpers.classCallCheck(this, RichTextEditor);

    var _this = babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(RichTextEditor).apply(this, arguments));

    _this._keyEmitter = new EventEmitter();
    autobind(_this);
    return _this;
  }

  babelHelpers.createClass(RichTextEditor, [{
    key: 'render',
    value: function render() {
      var _cx;

      var _props = this.props;
      var value = _props.value;
      var className = _props.className;
      var toolbarClassName = _props.toolbarClassName;
      var editorClassName = _props.editorClassName;
      var placeholder = _props.placeholder;
      var customStyleMap = _props.customStyleMap;
      var otherProps = babelHelpers.objectWithoutProperties(_props, ['value', 'className', 'toolbarClassName', 'editorClassName', 'placeholder', 'customStyleMap']);

      var editorState = value.getEditorState();
      customStyleMap = customStyleMap ? babelHelpers.extends({}, styleMap, customStyleMap) : styleMap;

      // If the user changes block type before entering any text, we can either
      // style the placeholder or hide it. Let's just hide it for now.
      var combinedEditorClassName = cx((_cx = {}, babelHelpers.defineProperty(_cx, styles$7.editor, true), babelHelpers.defineProperty(_cx, styles$7.hidePlaceholder, this._shouldHidePlaceholder()), _cx), editorClassName);
      return React.createElement(
        'div',
        { className: cx(styles$7.root, className) },
        React.createElement(EditorToolbar, {
          className: toolbarClassName,
          keyEmitter: this._keyEmitter,
          editorState: editorState,
          onChange: this._onChange,
          focusEditor: this._focus
        }),
        React.createElement(
          'div',
          { className: combinedEditorClassName },
          React.createElement(Editor, babelHelpers.extends({}, otherProps, {
            blockStyleFn: getBlockStyle,
            customStyleMap: customStyleMap,
            editorState: editorState,
            handleReturn: this._handleReturn,
            keyBindingFn: this._customKeyHandler,
            handleKeyCommand: this._handleKeyCommand,
            onTab: this._onTab,
            onChange: this._onChange,
            placeholder: placeholder,
            ref: 'editor',
            spellCheck: true
          }))
        )
      );
    }
  }, {
    key: '_shouldHidePlaceholder',
    value: function _shouldHidePlaceholder() {
      var editorState = this.props.value.getEditorState();
      var contentState = editorState.getCurrentContent();
      if (!contentState.hasText()) {
        if (contentState.getBlockMap().first().getType() !== 'unstyled') {
          return true;
        }
      }
      return false;
    }
  }, {
    key: '_handleReturn',
    value: function _handleReturn(event) {
      if (this._handleReturnSoftNewline(event)) {
        return true;
      }
      if (this._handleReturnEmptyListItem()) {
        return true;
      }
      if (this._handleReturnSpecialBlock()) {
        return true;
      }
      return false;
    }

    // `shift + return` should insert a soft newline.

  }, {
    key: '_handleReturnSoftNewline',
    value: function _handleReturnSoftNewline(event) {
      var editorState = this.props.value.getEditorState();
      if (isSoftNewlineEvent(event)) {
        var selection = editorState.getSelection();
        if (selection.isCollapsed()) {
          this._onChange(RichUtils.insertSoftNewline(editorState));
        } else {
          var content = editorState.getCurrentContent();
          var newContent = Modifier.removeRange(content, selection, 'forward');
          var newSelection = newContent.getSelectionAfter();
          var block = newContent.getBlockForKey(newSelection.getStartKey());
          newContent = Modifier.insertText(newContent, newSelection, '\n', block.getInlineStyleAt(newSelection.getStartOffset()), null);
          this._onChange(EditorState.push(editorState, newContent, 'insert-fragment'));
        }
        return true;
      }
      return false;
    }

    // If the cursor is in an empty list item when return is pressed, then the
    // block type should change to normal (end the list).

  }, {
    key: '_handleReturnEmptyListItem',
    value: function _handleReturnEmptyListItem() {
      var editorState = this.props.value.getEditorState();
      var selection = editorState.getSelection();
      if (selection.isCollapsed()) {
        var contentState = editorState.getCurrentContent();
        var blockKey = selection.getStartKey();
        var block = contentState.getBlockForKey(blockKey);
        if (isListItem(block) && block.getLength() === 0) {
          var depth = block.getDepth();
          var newState = depth === 0 ? changeBlockType(editorState, blockKey, BLOCK_TYPE.UNSTYLED) : changeBlockDepth(editorState, blockKey, depth - 1);
          this._onChange(newState);
          return true;
        }
      }
      return false;
    }

    // If the cursor is at the end of a special block (any block type other than
    // normal or list item) when return is pressed, new block should be normal.

  }, {
    key: '_handleReturnSpecialBlock',
    value: function _handleReturnSpecialBlock() {
      var editorState = this.props.value.getEditorState();
      var selection = editorState.getSelection();
      if (selection.isCollapsed()) {
        var contentState = editorState.getCurrentContent();
        var blockKey = selection.getStartKey();
        var block = contentState.getBlockForKey(blockKey);
        if (!isListItem(block) && block.getType() !== BLOCK_TYPE.UNSTYLED) {
          // If cursor is at end.
          if (block.getLength() === selection.getStartOffset()) {
            var newEditorState = insertBlockAfter(editorState, blockKey, BLOCK_TYPE.UNSTYLED);
            this._onChange(newEditorState);
            return true;
          }
        }
      }
      return false;
    }
  }, {
    key: '_onTab',
    value: function _onTab(event) {
      var editorState = this.props.value.getEditorState();
      var newEditorState = RichUtils.onTab(event, editorState, MAX_LIST_DEPTH);
      if (newEditorState !== editorState) {
        this._onChange(newEditorState);
      }
    }
  }, {
    key: '_customKeyHandler',
    value: function _customKeyHandler(event) {
      // Allow toolbar to catch key combinations.
      var eventFlags = {};
      this._keyEmitter.emit('keypress', event, eventFlags);
      if (eventFlags.wasHandled) {
        return null;
      } else {
        return getDefaultKeyBinding(event);
      }
    }
  }, {
    key: '_handleKeyCommand',
    value: function _handleKeyCommand(command) {
      var editorState = this.props.value.getEditorState();
      var newEditorState = RichUtils.handleKeyCommand(editorState, command);
      if (newEditorState) {
        this._onChange(newEditorState);
        return true;
      } else {
        return false;
      }
    }
  }, {
    key: '_onChange',
    value: function _onChange(editorState) {
      var _props2 = this.props;
      var onChange = _props2.onChange;
      var value = _props2.value;

      if (onChange != null) {
        var newValue = value.setEditorState(editorState);
        onChange(newValue);
      }
    }
  }, {
    key: '_focus',
    value: function _focus() {
      this.refs.editor.focus();
    }
  }]);
  return RichTextEditor;
}(React.Component);

function getBlockStyle(block) {
  var result = styles$7.block;
  switch (block.getType()) {
    case 'unstyled':
      return cx(result, styles$7.paragraph);
    case 'blockquote':
      return cx(result, styles$7.blockquote);
    case 'code-block':
      return cx(result, styles$7.codeBlock);
    default:
      return result;
  }
}

var decorator = new CompositeDecorator([LinkDecorator]);

function createEmptyValue() {
  return EditorValue.createEmpty(decorator);
}

function createValueFromString(markup, format) {
  return EditorValue.createFromString(markup, format, decorator);
}

// $FlowIssue - This should probably not be done this way.
Object.assign(RichTextEditor, {
  EditorValue: EditorValue,
  decorator: decorator,
  createEmptyValue: createEmptyValue,
  createValueFromString: createValueFromString
});

export { EditorValue, decorator, createEmptyValue, createValueFromString };
export default RichTextEditor;
