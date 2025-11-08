export default function StatusDot({ online = false, className = "" }) {
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${online ? "bg-green-400" : "bg-gray-400"} ${className}`}
    />
  );
}
