import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <section className="pt-32 pb-20 px-4">
        <Button variant="primary" size="xl">
          Anand Mansabdar
        </Button>
      </section>
    </div>
  );
}
