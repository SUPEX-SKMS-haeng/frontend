import { useState } from 'react';

export interface LoginFormProps {
  onSubmit: (data: { id: string; password: string }) => Promise<void>;
  isLoading?: boolean;
  error?: Error | null;
}

export interface LoginFormChildrenProps {
  id: string;
  password: string;
  isLoading: boolean;
  error: Error | null;
  handleIdChange: (value: string) => void;
  handlePasswordChange: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

interface LoginFormComponentProps extends LoginFormProps {
  children: (props: LoginFormChildrenProps) => React.ReactNode;
}

export const LoginForm = ({
  onSubmit,
  isLoading = false,
  error = null,
  children,
}: LoginFormComponentProps) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !password) return;
    await onSubmit({ id, password });
  };

  return (
    <>
      {children({
        id,
        password,
        isLoading,
        error,
        handleIdChange: setId,
        handlePasswordChange: setPassword,
        handleSubmit,
      })}
    </>
  );
};
