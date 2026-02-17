import "./button.scss";

interface ButtonProps {
  variant?: "primary" | "secondary";
  onClick?: () => void;
  text: string;
  type?: "button" | "submit" | "reset";
}

const Button = ({text, variant = "primary", onClick, type}: ButtonProps) => {
  return (
    <button type={type} className={`btn btn--${variant}`} onClick={onClick}>
      {text}
    </button>
  );
}

export default Button;