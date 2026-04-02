import { useState, KeyboardEvent, useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { useChatSendHandler } from '@/hooks/useChatSendHandler';
import { useAtom, useAtomValue } from 'jotai';
import {
  chatDataAtom,
  chatFamilyAtom,
  currentChatIdAtom,
} from '@/store/chat';
import { useChatScrollHandler } from '@/hooks/chatScrollHandler';

const ChatInput = () => {
  const currentChatId = useAtomValue(currentChatIdAtom);
  const chatData = useAtomValue(chatFamilyAtom(currentChatId));
  const [, setChatData] = useAtom(chatDataAtom);
  const isGenerating = chatData.isGenerating;

  const { sendMessage, cancelMessage } = useChatSendHandler(currentChatId);
  const { scrollToBottom } = useChatScrollHandler();

  const [value, setValue] = useState('');
  // isGenerating 상태일 때는 항상 버튼 활성화 (중지 버튼이므로)
  const isEnabled = isGenerating || value.trim().length > 0;
  const isInputDisabled = isGenerating;

  const setUserInput = (value: string) => {
    setChatData({
      id: currentChatId,
      data: {
        userInput: value,
      },
    });
  };

  const handleSend = () => {
    if (value.trim().length > 0) {
      sendMessage(value);
      scrollToBottom();
      setUserInput('');
      setValue('');
    }
  };

  const handleCancel = () => {
    cancelMessage(currentChatId);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 생성 중일 때는 엔터키 동작 방지
    if (isGenerating) {
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className='flex-shrink-0 px-8 pt-6 pb-8 bg-white'>
      <div className='max-w-3xl mx-auto'>
        <div
          className='flex items-center gap-3 px-5 py-3.5 rounded-xl border transition-all bg-neutral-50 border-neutral-200/60 shadow-sm hover:shadow-md hover:border-neutral-300/60'
        >
          <input
            type='text'
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='메시지를 입력하세요.'
            className='flex-1 bg-transparent text-[15px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none'
            disabled={isInputDisabled}
          />
          <button
            onClick={isGenerating ? handleCancel : handleSend}
            disabled={!isEnabled || isGenerating}
            className={`flex-shrink-0 p-2.5 rounded-lg transition-all ${
              isEnabled && !isGenerating
                ? 'text-neutral-900 bg-neutral-200 cursor-pointer hover:bg-neutral-300'
                : 'text-neutral-400 cursor-not-allowed'
            }`}
          >
            {isGenerating ? (
              <Square className='w-4 h-4 fill-current' />
            ) : (
              <ArrowUp className='w-4 h-4' />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
