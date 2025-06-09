export default {
  title: 'Components/Card',
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    content: { control: 'text' },
    variant: {
      control: { type: 'select' },
      options: ['default', 'glass', 'interactive'],
    },
  },
};

const createCard = ({ title, content, variant = 'default' }) => {
  const card = document.createElement('div');
  
  switch (variant) {
    case 'glass':
      card.className = 'card-glass';
      break;
    case 'interactive':
      card.className = 'card-interactive';
      break;
    default:
      card.className = 'card';
  }
  
  if (title) {
    const titleElement = document.createElement('h3');
    titleElement.innerText = title;
    card.appendChild(titleElement);
  }
  
  if (content) {
    const contentElement = document.createElement('p');
    contentElement.innerText = content;
    card.appendChild(contentElement);
  }
  
  return card;
};

export const Default = {
  args: {
    title: 'カードタイトル',
    content: 'これはカードのコンテンツです。情報を整理して表示するのに便利です。',
    variant: 'default',
  },
  render: createCard,
};

export const Glass = {
  args: {
    title: 'グラスモーフィズム',
    content: '透明感のある美しいカードデザインです。',
    variant: 'glass',
  },
  render: createCard,
};

export const Interactive = {
  args: {
    title: 'インタラクティブカード',
    content: 'ホバーすると変化するカードです。',
    variant: 'interactive',
  },
  render: createCard,
};

export const AllVariants = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
    container.style.gap = '1.5rem';
    
    const variants = [
      { variant: 'default', title: 'デフォルトカード' },
      { variant: 'glass', title: 'グラスカード' },
      { variant: 'interactive', title: 'インタラクティブカード' },
    ];
    
    variants.forEach(({ variant, title }) => {
      const card = createCard({
        title,
        content: 'これはサンプルコンテンツです。',
        variant,
      });
      container.appendChild(card);
    });
    
    return container;
  },
};