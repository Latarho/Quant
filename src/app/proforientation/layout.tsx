import { ProforientationProvider } from "@/contexts/proforientation-context";

export default function ProforientationLayout({ children }: { children: React.ReactNode }) {
  return <ProforientationProvider>{children}</ProforientationProvider>;
}
