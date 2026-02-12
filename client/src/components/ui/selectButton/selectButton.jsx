import React from "react";
import * as Select from "@radix-ui/react-select";
import { ChevronDownIcon, CheckIcon } from "@radix-ui/react-icons";
import "./selectButton.css";

export function SelectButton({
  value,
  onChange,
  placeholder = "Select...",
  options = [],
  className = "",
}) {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger className={`SelectTrigger ${className}`}>
        <Select.Value placeholder={placeholder} />

        <Select.Icon>
          <ChevronDownIcon size={16} />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="SelectContent">
          <Select.Viewport className="SelectViewport">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="SelectItem"
              >
                <Select.ItemText>{option.label}</Select.ItemText>

                <Select.ItemIndicator className="SelectItemIndicator">
                  <CheckIcon size={16} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
