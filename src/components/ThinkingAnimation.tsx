export function ThinkingAnimation() {
  return (
    <div className="flex items-center gap-1 p-3">
      <div 
        className="w-2 h-2 rounded-full bg-primary animate-thinking"
        style={{ animationDelay: '0s' }}
      />
      <div 
        className="w-2 h-2 rounded-full bg-primary animate-thinking"
        style={{ animationDelay: '0.2s' }}
      />
      <div 
        className="w-2 h-2 rounded-full bg-primary animate-thinking"
        style={{ animationDelay: '0.4s' }}
      />
    </div>
  );
}
