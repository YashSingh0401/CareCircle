import sys

path = "C:/Users/carecircle/Frontend/app/dashboard/admin/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'import { useRealtimeSimulatorStore } from "@/lib/realtime/realtimeSimulatorStore";',
    'import { useAppStore } from "@/lib/store";'
)

old_hooks = """  const liveQueue = useRealtimeSimulatorStore((s) => s.liveQueue);
  const liveDoctors = useRealtimeSimulatorStore((s) => s.liveDoctors);
  const liveEmergencies = useRealtimeSimulatorStore((s) => s.liveEmergencies);
  const feedItems = useRealtimeSimulatorStore((s) => s.feedItems);
  const toastQueue = useRealtimeSimulatorStore((s) => s.toastQueue);"""

new_hooks = """  const liveQueue = useAppStore((s) => s.liveQueue);
  const liveDoctors = useAppStore((s) => s.liveDoctors);
  const liveEmergencies = useAppStore((s) => s.liveEmergencies);
  const feedItems = useAppStore((s) => s.feedItems);
  const toastQueue = useAppStore((s) => s.toastQueue);
  const fetchQueue = useAppStore((s) => s.fetchQueue);
  const fetchDoctors = useAppStore((s) => s.fetchDoctors);
  const fetchEmergencies = useAppStore((s) => s.fetchEmergencies);

  React.useEffect(() => {
    fetchDoctors();
    fetchEmergencies();
    fetchQueue("Q-HSP-101");
  }, [fetchQueue, fetchDoctors, fetchEmergencies]);"""

content = content.replace(old_hooks, new_hooks)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
print("Done refactoring admin dashboard!")
