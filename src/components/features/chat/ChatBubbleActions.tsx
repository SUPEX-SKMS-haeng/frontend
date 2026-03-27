import { useEffect, useRef, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/chat/useToast';

export const ChatCopy = ({ message }: { message: string }) => {
  const { t } = useTranslation('common');
  const [copied, setCopied] = useState(false);
  const timeRef = useRef(5);
  const { showToast } = useToast();

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(message);
        setCopied(true);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = message;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
          setCopied(true);
        } else {
          showToast(t('error.copyMsg', '복사에 실패했습니다.'));
        }
      }
    } catch (err) {
      console.error('Copy failed:', err);
      showToast(
        t('error.copyNotSupported', '복사를 지원하지 않는 브라우저입니다.')
      );
    }
  };

  useEffect(() => {
    if (copied) {
      timeRef.current = 5;
      const timer = setInterval(() => {
        timeRef.current -= 1;
        if (timeRef.current === 0) {
          setCopied(false);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [copied]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleCopy}
            disabled={copied}
            className={cn(
              'p-1.5 rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800',
              'text-gray-500 dark:text-gray-400'
            )}
          >
            {copied ? (
              <Check className='w-4 h-4' />
            ) : (
              <Copy className='w-4 h-4' />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side='bottom'>
          <p>복사하기</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
