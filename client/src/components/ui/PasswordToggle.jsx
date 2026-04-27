import { unstable_PasswordToggleField as PasswordToggleField } from "radix-ui";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";

export const PasswordToggle = ({
  placeholder = "••••••••",
  error = false,
  size = "md",
  className = "",
  ...props
}) => {
  const sizeClass = `input-${size}`;
  const errorClass = error ? "input-error" : "";

  return (
    <PasswordToggleField.Root>
      <div className={`password-toggle-wrapper ${className}`}>
        <PasswordToggleField.Input
          placeholder={placeholder}
          className={`input password-input ${sizeClass} ${errorClass}`}
          {...props}
        />
        <PasswordToggleField.Toggle className="password-toggle-button">
          <PasswordToggleField.Icon
            visible={<EyeOpenIcon className="toggle-icon" />}
            hidden={<EyeClosedIcon className="toggle-icon" />}
          />
        </PasswordToggleField.Toggle>
      </div>
    </PasswordToggleField.Root>
  );
};
