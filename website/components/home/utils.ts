export const getQuickStart = (comment: string) => `import { Fluxdown } from 'fluxdown';

type MessageProps = {
  text: string;
  isStreaming: boolean;
};

${comment}
export function Message({
  text,
  isStreaming,
}: MessageProps) {
  return (
    <Fluxdown
      text={text}
      streaming={isStreaming}
    />
  );
}`;
