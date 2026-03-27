import { useState, KeyboardEvent } from 'react';
import { ArrowUp } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const [value, setValue] = useState('');
  const isEnabled = value.trim().length > 0;

  const handleSend = () => {
    if (isEnabled) {
      onSendMessage(value);
      setValue('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className='flex-shrink-0 px-8 pt-6 pb-8 bg-white'>
      <div className='max-w-3xl mx-auto'>
        <div className='flex items-center gap-3 px-5 py-3.5 rounded-xl bg-neutral-50 border border-neutral-200/60 shadow-sm hover:shadow-md hover:border-neutral-300/60 transition-all'>
          <input
            type='text'
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='메시지를 입력하세요.'
            className='flex-1 bg-transparent text-[15px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none'
          />
          <button
            onClick={handleSend}
            disabled={!isEnabled}
            className={`flex-shrink-0 p-2.5 rounded-lg transition-all ${
              isEnabled
                ? 'text-neutral-900 bg-neutral-200 cursor-pointer hover:bg-neutral-300'
                : 'text-neutral-400 cursor-not-allowed'
            }`}
          >
            <ArrowUp className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
