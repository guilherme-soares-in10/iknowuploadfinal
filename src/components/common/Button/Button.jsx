import './Button.css'

const Button = ({ 
    className, 
    text, 
    onClick, 
    type = 'button', // Default to 'button' type
    backgroundColor, 
    color, 
    fontSize, 
    fontWeight, 
    padding, 
    borderRadius, 
    border, 
    width, 
    height, 
    margin, 
    cursor, 
    transition, 
    hoverBackgroundColor, 
    hoverColor, 
    hoverFontSize, 
    hoverFontWeight, 
    hoverPadding, 
    hoverBorderRadius, 
    hoverBorder, 
    hoverWidth, 
    hoverHeight, 
    hoverMargin, 
    hoverCursor, 
    hoverTransition
}) => {
    const handleClick = (e) => {
        if (onClick) {
            e.preventDefault(); // Prevent default form submission
            onClick(e);
        }
    };

    return (
        <button 
            type={type}
            onClick={handleClick} 
            className={className} 
            style={{
                backgroundColor, 
                color, 
                fontSize, 
                fontWeight, 
                padding, 
                borderRadius, 
                border, 
                width, 
                height, 
                margin, 
                cursor, 
                transition, 
                hoverBackgroundColor, 
                hoverColor, 
                hoverFontSize, 
                hoverFontWeight, 
                hoverPadding, 
                hoverBorderRadius, 
                hoverBorder, 
                hoverWidth, 
                hoverHeight, 
                hoverMargin, 
                hoverCursor, 
                hoverTransition
            }}
        >
            {text}
        </button>
    )
}

export default Button;