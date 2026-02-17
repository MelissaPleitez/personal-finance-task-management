
interface InputProps {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input = ({onChange}: InputProps) => {
  return (
    <input className="input" onChange={onChange} />
  )
}

export default Input