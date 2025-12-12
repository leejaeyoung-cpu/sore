import './Button.css'

function Button({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    disabled = false,
    onClick,
    type = 'button',
    icon,
    ...props
}) {
    const className = `
    btn 
    btn-${variant} 
    btn-${size}
    ${fullWidth ? 'btn-full' : ''}
    ${disabled ? 'btn-disabled' : ''}
  `.trim().replace(/\s+/g, ' ')

    return (
        <button
            type={type}
            className={className}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {icon && <span className="btn-icon">{icon}</span>}
            <span className="btn-text">{children}</span>
        </button>
    )
}

export default Button
