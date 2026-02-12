import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Link } from "react-router-dom";
import "./DropdownMenu.css";

export function Dropdown({
  trigger,
  items = [],
  align = "end",
  side = "bottom",
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="dropdownContent"
          align={align}
          side={side}
          sideOffset={8}
        >
          {items.map((item, index) => {
            if (item.separator) {
              return (
                <DropdownMenu.Separator
                  key={index}
                  className="dropdownSeparator"
                />
              );
            }

            const className = `
              dropdownItem
              ${item.variant === "danger" ? "danger" : ""}
              ${item.disabled ? "disabled" : ""}
            `;

            const content = (
              <>
                {item.icon && <span className="icon">{item.icon}</span>}
                {item.label}
              </>
            );

            if (item.href) {
              return (
                <DropdownMenu.Item
                  key={index}
                  asChild
                  disabled={item.disabled}
                  className={className}
                >
                  <Link to={item.href}>{content}</Link>
                </DropdownMenu.Item>
              );
            }

            return (
              <DropdownMenu.Item
                key={index}
                disabled={item.disabled}
                className={className}
                onClick={() => {
                  if (!item.disabled && item.onClick) {
                    item.onClick(item);
                  }
                }}
              >
                {content}
              </DropdownMenu.Item>
            );
          })}

          <DropdownMenu.Arrow className="dropdownArrow" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
