/**
 * Shared message types for agent ↔ client WebSocket protocol
 */

export const MessageType = {
  CHAT_CHUNK: "chat_chunk",
  CHAT_DONE: "chat_done",
  ERROR: "error",
  GENERATION_START: "generation_start",
  GENERATION_FILE: "generation_file",
  GENERATION_COMPLETE: "generation_complete",
  GENERATION_ERROR: "generation_error",
  TOOL_PENDING_APPROVAL: "tool_pending_approval",
  TOOL_RESULT: "tool_result",
  TOOL_ERROR: "tool_error",
  WIZARD_START: "wizard_start",
  WIZARD_SELECT_TEMPLATE: "wizard_select_template",
  WIZARD_SET_NAME: "wizard_set_name",
  WIZARD_COMPLETE: "wizard_complete",
  PREVIEW_ERROR: "preview_error",
  PREVIEW_ERROR_ACK: "preview_error_ack",
} as const;

export type MessageTypeValue = (typeof MessageType)[keyof typeof MessageType];
