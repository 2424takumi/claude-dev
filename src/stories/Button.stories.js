export default {
  title: 'Components/Button',
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'icon'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    disabled: { control: 'boolean' },
  },
};

const createButton = ({ label, variant = 'primary', size = 'medium', disabled = false }) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.innerText = label;
  button.className = `btn-${variant}`;
  
  if (size !== 'medium') {
    button.classList.add(`btn-${size}`);
  }
  
  if (disabled) {
    button.disabled = true;
  }
  
  return button;
};

export const Primary = {
  args: {
    label: 'プライマリボタン',
    variant: 'primary',
  },
  render: createButton,
};

export const Secondary = {
  args: {
    label: 'セカンダリボタン',
    variant: 'secondary',
  },
  render: createButton,
};

export const Ghost = {
  args: {
    label: 'ゴーストボタン',
    variant: 'ghost',
  },
  render: createButton,
};

export const AllVariants = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.gap = '1rem';
    container.style.flexWrap = 'wrap';
    
    const variants = ['primary', 'secondary', 'ghost'];
    variants.forEach(variant => {
      const button = createButton({ label: variant, variant });
      container.appendChild(button);
    });
    
    return container;
  },
};