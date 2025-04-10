import { createReducer } from '../../utils/createReducer';
import { BehaviorState } from '../types';

import {
  BehaviorActions,
  ToggleInputDisabled,
  TOGGLE_CHAT,
  TOGGLE_INPUT_DISABLED,
  TOGGLE_FORCED_SCREEN_RECORDER,
  TOGGLE_MESSAGE_LOADER,
  ToggleForcedScreenRecorder,
  TOGGLE_PASTE_ENABLED,
  TogglePasteEnabled
} from '../actions/types';

const initialState = {
  showChat: false,
  disabledInput: false,
  forcedScreenRecorder: false,
  messageLoader: false,
  pasteEnabled: true,
};

const behaviorReducer = {
  [TOGGLE_CHAT]: (state: BehaviorState) => ({ ...state, showChat: !state.showChat}),

  [TOGGLE_INPUT_DISABLED]: (state: BehaviorState, toggle: ToggleInputDisabled) => ({ ...state, disabledInput: toggle.value }),
  [TOGGLE_FORCED_SCREEN_RECORDER]: (state: BehaviorState, toggle: ToggleForcedScreenRecorder) => ({ ...state, forcedScreenRecorder: toggle.value }),
  [TOGGLE_PASTE_ENABLED]: (state: BehaviorState, toggle: TogglePasteEnabled) => ({...state, pasteEnabled: toggle.value}),

  [TOGGLE_MESSAGE_LOADER]: (state: BehaviorState) => ({ ...state, messageLoader: !state.messageLoader })
};

export default (state: BehaviorState = initialState, action: BehaviorActions) => createReducer(behaviorReducer, state, action);
