import "./input.scss";

interface InputProps {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  value?: string;
}

const Input = ({ onChange, type, value }: InputProps) => {
  return (
    <input type={type} value={value} className="input" onChange={onChange} />
  )
}

export default Input