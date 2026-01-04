'use client';

const REACTIONS = ['👍', '❤️', '😊', '😂', '😮', '😢', '🔥', '🎉'];

interface ReactionPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

export function ReactionPicker({ onSelect, onClose }: ReactionPickerProps) {
  return (
    <div className="absolute bottom-full left-0 mb-2 rounded-lg border border-neutral-200 bg-white p-2 shadow-lg">
      <div className="flex gap-1">
        {REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-colors hover:bg-neutral-100"
            aria-label={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
