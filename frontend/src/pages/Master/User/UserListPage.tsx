import { useEffect, useState } from "react";
import { Edit3, ShieldCheck, ShieldX } from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { userService } from "../../../services/user.service";
import type { User } from "../../../types";

export default function UserListPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAll({ page: 1, limit: 100, search: search || undefined });
      setUsers(response.data.data || []);
    } catch (requestError) {
      const axiosError = requestError as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(loadUsers, 200);
    return () => window.clearTimeout(timer);
  }, [search]);

  const saveUser = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await userService.update(editing.id, { name: editing.name, email: editing.email, role: editing.role });
      setEditing(null);
      await loadUsers();
    } catch (requestError) {
      const axiosError = requestError as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || "Unable to update user.");
    } finally {
      setSaving(false);
    }
  };

  const toggleSuspension = async (target: User) => {
    if (!window.confirm(`${target.suspendedAt ? "Activate" : "Suspend"} ${target.name}?`)) return;
    try {
      await userService.update(target.id, { suspended: !target.suspendedAt });
      await loadUsers();
    } catch {
      setError("Unable to update account status.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="mt-1 text-gray-400">View and manage user accounts.</p>
      </div>
      {error && <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{error}</div>}
      <section className="rounded-2xl border border-gray-700 bg-gray-900/50 p-5">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users..." className="mb-5 w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-primary" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-700 text-gray-400"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Actions</th></tr></thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">Loading users...</td></tr> : users.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">No users found</td></tr> : users.map((account) => <tr key={account.id} className="hover:bg-gray-800/40"><td className="px-4 py-4 font-medium text-white">{account.name}</td><td className="px-4 py-4 text-gray-300">{account.email}</td><td className="px-4 py-4"><span className="rounded-full border border-gray-600 bg-gray-800 px-2 py-1 text-xs uppercase text-gray-300">{account.role}</span></td><td className="px-4 py-4"><span className={`rounded-full border px-2 py-1 text-xs ${account.suspendedAt ? "border-red-500/30 bg-red-500/10 text-red-400" : "border-green-500/30 bg-green-500/10 text-green-400"}`}>{account.suspendedAt ? "Suspended" : "Active"}</span></td><td className="px-4 py-4 text-gray-400">{account.createdAt ? new Date(account.createdAt).toLocaleDateString() : "-"}</td><td className="px-4 py-4"><div className="flex gap-2"><button type="button" onClick={() => setEditing(account)} className="rounded-md p-2 text-blue-400 hover:bg-blue-500/10" title="Edit user"><Edit3 className="h-4 w-4" /></button>{currentUser?.role === "admin" && String(currentUser.id) !== String(account.id) && <button type="button" onClick={() => toggleSuspension(account)} className={`rounded-md p-2 ${account.suspendedAt ? "text-green-400" : "text-red-400"} hover:bg-gray-700`} title={account.suspendedAt ? "Activate user" : "Suspend user"}>{account.suspendedAt ? <ShieldCheck className="h-4 w-4" /> : <ShieldX className="h-4 w-4" />}</button>}</div></td></tr>)}
            </tbody>
          </table>
        </div>
      </section>
      {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6"><h2 className="mb-5 text-xl font-bold text-white">Edit User</h2><div className="space-y-4"><input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white" placeholder="Name" /><input value={editing.email} onChange={(event) => setEditing({ ...editing, email: event.target.value })} className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white" placeholder="Email" /><select value={editing.role} onChange={(event) => setEditing({ ...editing, role: event.target.value as User["role"] })} className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white"><option value="user">User</option><option value="admin">Admin</option></select></div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-gray-700 px-4 py-2 text-gray-300">Cancel</button><button type="button" disabled={saving} onClick={saveUser} className="rounded-lg bg-primary px-4 py-2 font-semibold text-black disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button></div></div></div>}
    </div>
  );
}
