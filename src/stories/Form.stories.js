export default {
  title: 'Components/Form',
  tags: ['autodocs'],
};

export const Input = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '1rem';
    container.style.maxWidth = '400px';
    
    const label = document.createElement('label');
    label.innerText = 'メールアドレス';
    label.style.fontWeight = '500';
    label.style.marginBottom = '0.5rem';
    
    const input = document.createElement('input');
    input.type = 'email';
    input.className = 'input';
    input.placeholder = 'example@email.com';
    
    container.appendChild(label);
    container.appendChild(input);
    
    return container;
  },
};

export const TextArea = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '1rem';
    container.style.maxWidth = '400px';
    
    const label = document.createElement('label');
    label.innerText = 'コメント';
    label.style.fontWeight = '500';
    label.style.marginBottom = '0.5rem';
    
    const textarea = document.createElement('textarea');
    textarea.className = 'textarea';
    textarea.placeholder = 'コメントを入力してください...';
    textarea.rows = 4;
    
    container.appendChild(label);
    container.appendChild(textarea);
    
    return container;
  },
};

export const Switch = {
  render: () => {
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '1rem';
    
    const label = document.createElement('label');
    label.className = 'switch';
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    
    const slider = document.createElement('span');
    slider.className = 'switch-slider';
    
    label.appendChild(input);
    label.appendChild(slider);
    
    const text = document.createElement('span');
    text.innerText = '通知を有効にする';
    
    container.appendChild(label);
    container.appendChild(text);
    
    return container;
  },
};

export const CompleteForm = {
  render: () => {
    const form = document.createElement('form');
    form.style.maxWidth = '400px';
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.gap = '1.5rem';
    
    // Name input
    const nameGroup = document.createElement('div');
    const nameLabel = document.createElement('label');
    nameLabel.innerText = '名前';
    nameLabel.style.display = 'block';
    nameLabel.style.marginBottom = '0.5rem';
    nameLabel.style.fontWeight = '500';
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'input';
    nameInput.placeholder = '山田 太郎';
    
    nameGroup.appendChild(nameLabel);
    nameGroup.appendChild(nameInput);
    
    // Email input
    const emailGroup = document.createElement('div');
    const emailLabel = document.createElement('label');
    emailLabel.innerText = 'メールアドレス';
    emailLabel.style.display = 'block';
    emailLabel.style.marginBottom = '0.5rem';
    emailLabel.style.fontWeight = '500';
    
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.className = 'input';
    emailInput.placeholder = 'example@email.com';
    
    emailGroup.appendChild(emailLabel);
    emailGroup.appendChild(emailInput);
    
    // Message textarea
    const messageGroup = document.createElement('div');
    const messageLabel = document.createElement('label');
    messageLabel.innerText = 'メッセージ';
    messageLabel.style.display = 'block';
    messageLabel.style.marginBottom = '0.5rem';
    messageLabel.style.fontWeight = '500';
    
    const messageTextarea = document.createElement('textarea');
    messageTextarea.className = 'textarea';
    messageTextarea.placeholder = 'メッセージを入力してください...';
    messageTextarea.rows = 4;
    
    messageGroup.appendChild(messageLabel);
    messageGroup.appendChild(messageTextarea);
    
    // Switch
    const switchContainer = document.createElement('div');
    switchContainer.style.display = 'flex';
    switchContainer.style.alignItems = 'center';
    switchContainer.style.gap = '1rem';
    
    const switchLabel = document.createElement('label');
    switchLabel.className = 'switch';
    
    const switchInput = document.createElement('input');
    switchInput.type = 'checkbox';
    
    const switchSlider = document.createElement('span');
    switchSlider.className = 'switch-slider';
    
    switchLabel.appendChild(switchInput);
    switchLabel.appendChild(switchSlider);
    
    const switchText = document.createElement('span');
    switchText.innerText = '利用規約に同意する';
    
    switchContainer.appendChild(switchLabel);
    switchContainer.appendChild(switchText);
    
    // Submit button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'btn-primary';
    submitButton.innerText = '送信する';
    submitButton.style.marginTop = '1rem';
    
    // Prevent form submission in Storybook
    form.onsubmit = (e) => {
      e.preventDefault();
      return false;
    };
    
    form.appendChild(nameGroup);
    form.appendChild(emailGroup);
    form.appendChild(messageGroup);
    form.appendChild(switchContainer);
    form.appendChild(submitButton);
    
    return form;
  },
};