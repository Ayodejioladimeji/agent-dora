type FieldType = "dropdown" | "multiselect" | "text" | "number"

interface AgentConfigBase {
    label: string
    type: FieldType
    description: string
    required: boolean
}

interface DropdownField extends AgentConfigBase {
    type: "dropdown"
    options: string[]
    default: string
}

interface MultiSelectField extends AgentConfigBase {
    type: "multiselect"
    options: string[]
    default: string[]
}

interface TextField extends AgentConfigBase {
    type: "text"
    default: string
}

interface NumberField extends AgentConfigBase {
    type: "number"
    default: number
}

export type AgentConfigField = DropdownField | MultiSelectField | TextField | NumberField
