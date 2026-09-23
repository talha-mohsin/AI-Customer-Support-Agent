import { Mail, Shield, User as UserIcon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { PageHeader } from "../components/ui/PageHeader";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";

export function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader title="Profile" description="Your account details." />

      <div className="max-w-md rounded-lg border border-border bg-surface p-6">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size={56} />
          <div>
            <p className="text-lg font-semibold text-text">{user.name}</p>
            <Badge tone="accent">{user.role.replace("_", " ")}</Badge>
          </div>
        </div>

        <dl className="mt-6 flex flex-col gap-4 text-sm">
          <ProfileRow icon={UserIcon} label="Name" value={user.name} />
          <ProfileRow icon={Mail} label="Email" value={user.email} />
          <ProfileRow icon={Shield} label="Role" value={user.role.replace("_", " ")} />
        </dl>
      </div>
    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 border-t border-border pt-4 first:border-t-0 first:pt-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-alt text-muted">
        <Icon size={15} />
      </div>
      <div>
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="font-medium text-text">{value}</dd>
      </div>
    </div>
  );
}
