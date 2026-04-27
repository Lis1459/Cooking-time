import "../../styles/components.css";
export { PasswordToggle } from "./PasswordToggle";

export const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  className = "",
  ...props
}) => {
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${disabled ? "disabled" : ""} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({
  type = "text",
  placeholder = "",
  value,
  onChange,
  disabled = false,
  className = "",
  size = "md",
  error = false,
  ...props
}) => {
  const sizeClass = `input-${size}`;
  const errorClass = error ? "input-error" : "";

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`input ${sizeClass} ${errorClass} ${className}`}
      {...props}
    />
  );
};

export const Card = ({ children, className = "", ...props }) => (
  <div className={`card ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = "" }) => (
  <div className={`card-header ${className}`}>{children}</div>
);

export const CardContent = ({ children, className = "" }) => (
  <div className={`card-content ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = "" }) => (
  <div className={`card-footer ${className}`}>{children}</div>
);

export const Textarea = ({
  placeholder = "",
  value,
  onChange,
  rows = 4,
  disabled = false,
  className = "",
  error = false,
  ...props
}) => {
  const errorClass = error ? "input-error" : "";

  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      disabled={disabled}
      className={`textarea ${errorClass} ${className}`}
      {...props}
    />
  );
};

export const Label = ({ children, htmlFor, className = "" }) => (
  <label htmlFor={htmlFor} className={`label ${className}`}>
    {children}
  </label>
);

export const Badge = ({ children, variant = "default", className = "" }) => (
  <span className={`badge badge-${variant} ${className}`}>{children}</span>
);

export const Separator = ({ className = "", orientation = "horizontal" }) => (
  <div
    className={`separator separator-${orientation} ${className}`}
    role="separator"
    aria-orientation={orientation}
  />
);

export const Loader = ({ size = "md", className = "" }) => (
  <div className={`loader loader-${size} ${className}`}></div>
);

export const Alert = ({
  children,
  variant = "info",
  className = "",
  onClose = null,
}) => (
  <div className={`alert alert-${variant} ${className}`}>
    <div className="alert-content">{children}</div>
    {onClose && (
      <button className="alert-close" onClick={onClose}>
        ×
      </button>
    )}
  </div>
);

export const Select = ({
  options = [],
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  className = "",
  ...props
}) => (
  <select
    value={value}
    onChange={onChange}
    disabled={disabled}
    className={`select ${className}`}
    {...props}
  >
    <option value="">{placeholder}</option>
    {options.map((option) => (
      <option key={option.id || option.value} value={option.id || option.value}>
        {option.name || option.label}
      </option>
    ))}
  </select>
);

export const CheckBox = ({
  checked = false,
  onChange,
  label = "",
  disabled = false,
  className = "",
  ...props
}) => (
  <div className={`checkbox-wrapper ${className}`}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="checkbox"
      {...props}
    />
    {label && <label className="checkbox-label">{label}</label>}
  </div>
);

export const RadioGroup = ({
  options = [],
  value,
  onChange,
  name,
  className = "",
}) => (
  <div className={`radio-group ${className}`}>
    {options.map((option) => (
      <div key={option.id || option.value} className="radio-item">
        <input
          type="radio"
          id={`radio-${option.id || option.value}`}
          name={name}
          value={option.id || option.value}
          checked={value === (option.id || option.value)}
          onChange={onChange}
          className="radio"
        />
        <label
          htmlFor={`radio-${option.id || option.value}`}
          className="radio-label"
        >
          {option.name || option.label}
        </label>
      </div>
    ))}
  </div>
);
