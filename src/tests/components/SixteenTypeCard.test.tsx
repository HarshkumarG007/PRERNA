import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SixteenTypeCard } from '../../components/personality/SixteenTypeCard';
import { deriveSixteenType } from '../../engine/assessment/sixteenPersonalities';

describe('SixteenTypeCard component', () => {
  it('renders correctly with full SixteenTypeResult', () => {
    const sixteenType = deriveSixteenType({
      openness: 78,
      conscientiousness: 72,
      extraversion: 68,
      agreeableness: 80,
      neuroticism: 34,
    });

    const { container } = render(<SixteenTypeCard sixteenType={sixteenType} />);
    expect(container).toBeTruthy();
    expect(screen.getByText(sixteenType.fullCode)).toBeDefined();
    expect(screen.getByText(sixteenType.definition.name)).toBeDefined();
  });

  it('gracefully returns null without crashing if sixteenType is null or incomplete stub', () => {
    // Incomplete stub that previously triggered the webapp crash
    const stubSixteenType: any = {
      fullCode: 'ENFP',
      definition: { name: 'The Campaigner', hindiName: 'प्रणेता' }
    };

    const { container: container1 } = render(<SixteenTypeCard sixteenType={stubSixteenType} />);
    expect(container1.firstChild).toBeNull();

    const { container: container2 } = render(<SixteenTypeCard sixteenType={null as any} />);
    expect(container2.firstChild).toBeNull();

    const { container: container3 } = render(<SixteenTypeCard sixteenType={undefined as any} />);
    expect(container3.firstChild).toBeNull();
  });
});

