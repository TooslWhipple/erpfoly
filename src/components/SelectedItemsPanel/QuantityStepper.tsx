import { Minus, Plus } from 'lucide-react';
import { StepperContainer, StepperButton, StepperInput } from './styles';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 9999,
}: QuantityStepperProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      onChange(0);
      return;
    }
    const parsed = parseInt(raw, 10);
    if (Number.isFinite(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)));
    }
  };

  return (
    <StepperContainer>
      <StepperButton
        size="small"
        onClick={handleDecrement}
        disabled={value <= min}
      >
        <Minus size={14} />
      </StepperButton>
      <StepperInput
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
      />
      <StepperButton
        size="small"
        onClick={handleIncrement}
        disabled={value >= max}
      >
        <Plus size={14} />
      </StepperButton>
    </StepperContainer>
  );
}
