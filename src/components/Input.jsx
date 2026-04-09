const Input = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  required = false,
  className = "",
  options,
  rows,
  readOnly = false,
}) => {
  const fieldCls = `w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/30 transition-colors ${
    readOnly ? "bg-gray-50 cursor-not-allowed text-gray-600" : "bg-white"
  } ${error ? "border-primary" : "border-gray-200"}`;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={name} className="text-xs font-bold text-gray-600 uppercase tracking-wide">
          {label}
          {required && <span className="text-primary ml-1">*</span>}
        </label>
      )}

      {options ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={fieldCls}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : typeof rows === "number" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={`${fieldCls} resize-y min-h-[80px]`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          className={fieldCls}
        />
      )}

      {error && <span className="text-xs text-primary">{error}</span>}
    </div>
  );
};

export default Input;
