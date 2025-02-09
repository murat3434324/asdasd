export default function Title({ title }: { title: string }) {
  return (
    <div className="pb-4 border-b border-gray-300">
      <div className="text-2xl font-normal border-l-4 border-brown pl-2">
        {title}
      </div>
    </div>
  );
}
