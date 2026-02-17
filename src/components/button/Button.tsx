import "./button.scss";

interface ButtonProps {
  variant?: "primary" | "secondary";
  onClick?: () => void;
  text: string;
}

const Button = ({text, variant = "primary", onClick}: ButtonProps) => {
  return (
    <button className={`btn btn--${variant}`} onClick={onClick}>
      {text}
    </button>
  );
}

export default Button;