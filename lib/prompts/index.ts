import { SOP_SYSTEM_PROMPT, SOP_USER_PROMPT } from "./sop"
import { DV_PROTOCOL_SYSTEM_PROMPT, DV_PROTOCOL_USER_PROMPT } from "./dv-protocol"
import { CAPA_SYSTEM_PROMPT, CAPA_USER_PROMPT } from "./capa"

export type DocType = "SOP" | "DV_PROTOCOL" | "CAPA"

export interface PromptTemplate {
  systemPrompt: string
  userPrompt: (text: string) => string
}

export const PROMPT_TEMPLATES: Record<DocType, PromptTemplate> = {
  SOP: {
    systemPrompt: SOP_SYSTEM_PROMPT,
    userPrompt: SOP_USER_PROMPT,
  },
  DV_PROTOCOL: {
    systemPrompt: DV_PROTOCOL_SYSTEM_PROMPT,
    userPrompt: DV_PROTOCOL_USER_PROMPT,
  },
  CAPA: {
    systemPrompt: CAPA_SYSTEM_PROMPT,
    userPrompt: CAPA_USER_PROMPT,
  },
}

export function getPromptTemplate(docType: DocType): PromptTemplate {
  return PROMPT_TEMPLATES[docType] || PROMPT_TEMPLATES.SOP
}
