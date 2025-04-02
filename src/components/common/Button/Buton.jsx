import './Button.css'

const Button = ({ className, text, onClick, backgroundColor, color, fontSize, fontWeight, padding, borderRadius, border, width, height, margin, cursor, transition, hoverBackgroundColor, hoverColor, hoverFontSize, hoverFontWeight, hoverPadding, hoverBorderRadius, hoverBorder, hoverWidth, hoverHeight, hoverMargin, hoverCursor, hoverTransition}) => {
    return (
        <button onClick={onClick} className={className} style={{backgroundColor, color, fontSize, fontWeight, padding, borderRadius, border, width, height, margin, cursor, transition, hoverBackgroundColor, hoverColor, hoverFontSize, hoverFontWeight, hoverPadding, hoverBorderRadius, hoverBorder, hoverWidth, hoverHeight, hoverMargin, hoverCursor, hoverTransition}}>
            {text}
        </button>
    )
}

export default Button;