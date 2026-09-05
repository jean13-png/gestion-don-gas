export default function Icon({ name, className = "", fixedWidth = false }) {
  return (
    <i
      aria-hidden="true"
      className={`fa-solid fa-${name} ${fixedWidth ? "fa-fw" : ""} ${className}`}
    />
  );
}
