export function GradientMesh() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute -left-1/4 -top-1/2 h-[800px] w-[800px] rounded-full bg-gemini-blue/[0.04] blur-[120px] animate-gradient-shift" />
      <div className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-gemini-deep/[0.03] blur-[100px] animate-gradient-shift [animation-delay:4s] [animation-direction:reverse]" />
      <div className="absolute left-1/3 top-1/3 h-[400px] w-[400px] rounded-full bg-gemini-blue/[0.03] blur-[80px] animate-gradient-shift [animation-delay:2s]" />
    </div>
  );
}
