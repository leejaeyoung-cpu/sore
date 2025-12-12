import './Card.css'

function Card({
    children,
    title,
    subtitle,
    image,
    padding = 'md',
    shadow = true,
    hover = false,
    onClick,
    className = '',
    ...props
}) {
    const cardClassName = `
    card
    card-padding-${padding}
    ${shadow ? 'card-shadow' : ''}
    ${hover ? 'card-hover' : ''}
    ${onClick ? 'card-clickable' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ')

    return (
        <div className={cardClassName} onClick={onClick} {...props}>
            {image && (
                <div className="card-image">
                    <img src={image} alt={title || 'Card image'} />
                </div>
            )}
            {(title || subtitle) && (
                <div className="card-header">
                    {title && <h3 className="card-title">{title}</h3>}
                    {subtitle && <p className="card-subtitle">{subtitle}</p>}
                </div>
            )}
            <div className="card-content">
                {children}
            </div>
        </div>
    )
}

export default Card
