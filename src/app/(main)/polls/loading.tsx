import { Spinner } from "@/components/ui/spinner";

export default function PollsLoading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
