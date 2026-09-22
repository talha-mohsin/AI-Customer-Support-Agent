import { useAuth } from "../context/AuthContext";

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
      <div className="mt-4 max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <dl className="flex flex-col gap-3 text-sm">
          <div>
            <dt className="text-slate-500">Name</dt>
            <dd className="font-medium text-slate-900">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Role</dt>
            <dd className="font-medium text-slate-900">{user?.role}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
